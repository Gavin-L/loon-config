/**
 * Clash Verge Rev / Mihomo global extension script.
 * Public, no subscriptions or credentials. Compatible with active profiles.
 * Keep in: Profiles > Global Extension Script (not Merge).
 * Source: https://github.com/Gavin-L/loon-config
 */
function main(config, profileName) {
  if (!config || typeof config !== "object") return config;

  var prefix = "LoonWin-";
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
    return g && !/^LoonWin-/.test(g.name || "");
  }));

  // The Loon domain-only lists are also valid Mihomo classical text providers.
  var base="https://cdn.jsdelivr.net/gh/Gavin-L/loon-config@main/rules/";
  var routes=[
    ["Ads-Reject","REJECT"],
    ["Finance-Direct","DIRECT"],["Apple-Direct","DIRECT"],
    ["Microsoft-HK",groupName("HK")],
    ["YouTube-HK",groupName("HK")],
    ["AI-JP",groupName("JP")],
    ["Google-US",groupName("US")],
    ["GitHub-HK",groupName("HK")],
    ["Social-HK",groupName("HK")],
    ["Telegram-JP",groupName("JP")],
    ["Japan-JP",groupName("JP")],
    ["Spotify-US",groupName("US")],
    ["TikTok-TW",groupName("TW")],
    ["Streaming-HK",groupName("HK")],
    ["Other-HK",groupName("HK")]
  ];
  config["rule-providers"]=config["rule-providers"] || {};
  var ours=[];
  routes.forEach(function(pair){
    var key=prefix+pair[0];
    ours.push(key);
    config["rule-providers"][key]={
      type:"http", behavior:"classical", format:"text",
      url:base+pair[0]+".list", interval:21600,
      path:"./ruleset/"+key+".list"
    };
  });

  // Critical exceptions are placed above Microsoft & advertising catch-alls.
  var protect=[
    "DOMAIN-SUFFIX,upwork.com,DIRECT",
    "DOMAIN-SUFFIX,upwork.net,DIRECT",
    "DOMAIN-SUFFIX,labelbox.com,DIRECT",
    "DOMAIN-SUFFIX,alignerr.com,DIRECT",
    "DOMAIN-SUFFIX,windowsupdate.com,DIRECT",
    "DOMAIN-SUFFIX,delivery.mp.microsoft.com,DIRECT",
    "DOMAIN-SUFFIX,update.microsoft.com,DIRECT",
    "DOMAIN-SUFFIX,download.windowsupdate.com,DIRECT",
    "DOMAIN-SUFFIX,adl.windows.com,DIRECT",
    "DOMAIN-SUFFIX,emdl.ws.microsoft.com,DIRECT",
    "DOMAIN,download.microsoft.com,DIRECT",
    "DOMAIN,officecdn.microsoft.com,DIRECT",
    "DOMAIN-SUFFIX,download.visualstudio.microsoft.com,DIRECT",
    "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
    "DOMAIN-SUFFIX,msftncsi.com,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT",
    "DOMAIN-SUFFIX,tenpay.com,DIRECT",
    "DOMAIN-SUFFIX,icbc.com.cn,DIRECT",
    "DOMAIN-SUFFIX,ccb.com,DIRECT",
    "DOMAIN-SUFFIX,local,DIRECT",
    "DOMAIN-SUFFIX,lan,DIRECT",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve"
  ];
  var ownRules=protect.concat(routes.map(function(pair){
    return "RULE-SET,"+prefix+pair[0]+","+pair[1];
  }));
  ownRules.push("DOMAIN-SUFFIX,cn,DIRECT");
  ownRules.push("GEOIP,CN,DIRECT,no-resolve");
  var originalRules=Array.isArray(config.rules)?config.rules:[];
  var otherRules=originalRules.filter(function(rule){
    if (typeof rule!=="string") return false;
    if (/^MATCH,|^FINAL,/i.test(rule)) return false;
    if (/^RULE-SET,LoonWin-/i.test(rule)) return false;
    return ownRules.indexOf(rule)<0;
  });
  config.rules=ownRules.concat(otherRules,["MATCH,"+groupName("HK")]);
  // Never touch subscription URLs, proxy definitions, DNS or user credentials.
  return config;
}
