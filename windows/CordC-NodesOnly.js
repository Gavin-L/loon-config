/**
 * CordC: Optional same-region latency pools only; airport rules untouched.
 * Does NOT override rules, rule-providers, proxy providers, DNS, or subscriptions.
 * Low-rate (<=1x) automatic choice before same-region backup when available.
 * Automatic nodes/groups created ONLY; airport rules keep original targets.
 * https://github.com/Gavin-L/loon-config
 */
const main = (config) => {
  if (!config || typeof config !== "object") return config;

  var prefix = "AirportAuto-";
  var healthURL = "http://www.gstatic.com/generate_204";
  var interval = 300;
  var countries = [
    {id:"HK", display:"香港", code:"HK", rx:/🇭🇰|香港|港区|Hong[\s_-]*Kong|\bHK\b/i, filter:"🇭🇰|香港|港区|Hong[\\s_-]*Kong|\\bHK\\b"},
    {id:"JP", display:"日本", code:"JP", rx:/🇯🇵|日本|东京|東京|大阪|Japan|Tokyo|Osaka|\bJP\b|\bJPN\b/i, filter:"🇯🇵|日本|东京|東京|大阪|Japan|Tokyo|Osaka|\\bJP\\b|\\bJPN\\b"},
    {id:"US", display:"美国", code:"US", rx:/🇺🇸|美国|美國|洛杉矶|洛杉磯|纽约|紐約|西雅图|西雅圖|United[\s_-]*States|\bUS\b|\bUSA\b/i, filter:"🇺🇸|美国|美國|洛杉矶|洛杉磯|纽约|紐約|西雅图|西雅圖|United[\\s_-]*States|\\bUS\\b|\\bUSA\\b"},
    {id:"TW", display:"台湾", code:"TW", rx:/🇹🇼|台湾|台灣|台北|高雄|Taiwan|Taipei|\bTW\b/i, filter:"🇹🇼|台湾|台灣|台北|高雄|Taiwan|Taipei|\\bTW\\b"},
    {id:"SG", display:"新加坡", code:"SG", rx:/🇸🇬|新加坡|狮城|獅城|Singapore|\bSG\b/i, filter:"🇸🇬|新加坡|狮城|獅城|Singapore|\\bSG\\b"}
  ];
  var unwanted = /订阅|剩余|流量|到期|过期|官网|客服|工单|公告|通知|邀请|返利|续费|套餐|充值|邮箱|更新|群组|回国|游戏|中转|落地|入口/i;

  function rateOf(name) {
    var s=String(name || "");
    var m=s.match(/倍率\s*[:：=]?\s*(\d+(?:\.\d+)?)/i)
       || s.match(/(?:^|[^\d])(\d+(?:\.\d+)?)\s*[x×倍]/i)
       || s.match(/[x×]\s*(\d+(?:\.\d+)?)/i);
    return m ? Number(m[1]) : null;
  }
  function countryOf(name) {
    if (unwanted.test(name)) return null;
    var matching=countries.filter(function(r) {return r.rx.test(name);});
    return matching.length===1 ? matching[0].id : null;
  }
  function groupName(id) {return prefix+id+"-AUTO";}
  function buildAuto(name, nodes) {
    return {name:name, type:"url-test", proxies:nodes, url:healthURL, interval:interval, tolerance:100, lazy:true};
  }
  var existing=Array.isArray(config.proxies)?config.proxies:[];
  var names=existing.map(function(node){return node && node.name;})
    .filter(function(n){return typeof n==="string" && n.length>0;});
  var hasProviders=config["proxy-providers"] &&
    Object.keys(config["proxy-providers"]).length>0;
  var additions=[];
  var states={};

  countries.forEach(function(r){
    var local=names.filter(function(n){return countryOf(n)===r.id;});
    var low=local.filter(function(n){var x=rateOf(n);return x!==null && x>0 && x<=1;});
    var reserve=local.filter(function(n){return low.indexOf(n)<0;});
    var mainName=groupName(r.id);
    if (local.length===0 && hasProviders) {
      // Dynamic provider nodes are not enumerated at script time.
      // Keep only this region, never fall through to a different country.
      additions.push({
        name:mainName, type:"url-test", "include-all":true,
        filter:"(?i)(?:"+r.filter+")",
        "exclude-filter":"(?i)(?:"+countries.filter(function(c){return c.id!==r.id;})
          .map(function(c){return c.filter;}).join("|")+")",
        url:healthURL, interval:interval, tolerance:100, lazy:true
      });
      states[r.id]="provider";
    } else if (low.length && reserve.length) {
      var lowName=prefix+r.id+"-LOW";
      var backupName=prefix+r.id+"-BACKUP";
      additions.push(buildAuto(lowName,low),buildAuto(backupName,reserve));
      additions.push({
        name:mainName, type:"fallback",
        proxies:[lowName,backupName], url:healthURL, interval:interval, lazy:true
      });
      states[r.id]="low+backup";
    } else if (low.length || reserve.length) {
      additions.push(buildAuto(mainName,low.length?low:reserve));
      states[r.id]=low.length?"low-only":"region-only";
    } else {
      // Deliberately do not leak into another region if this region is missing.
      additions.push({name:mainName,type:"select",proxies:["REJECT"]});
      states[r.id]="missing";
    }
  });

  // Idempotence: each subscription reload can execute this script again.
  var ownNames=additions.map(function(x){return x.name;});
  var origGroups=Array.isArray(config["proxy-groups"])?config["proxy-groups"]:[];
  config["proxy-groups"]=additions.concat(origGroups.filter(function(g){
    return g && !/^AirportAuto-/.test(g.name || "");
  }));

  // Entire airport routing remains unchanged: no config.rules mutations.
  return config;
};
