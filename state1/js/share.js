/**
 * Created by bingo on 2017/12/5.
 */
window._bd_share_config={
    "common":{
        "bdPopTitle":"您的自定义pop窗口标题",
        "bdSnsKey":{},
        "bdText":"一款颤抖的跳跳侠小游戏",
        "bdMini":"2",
        "bdMiniList":false,
        "bdPic":"http://www.enjoyxgb.cn/smallGame/index.html", /* 此处填写要分享的地址 */
        "bdStyle":"0",
        "bdSize":"16"
    },
    "share":{}
};
with(document)0[
    (getElementsByTagName('head')[0]||body).
    appendChild(createElement('script')).
        src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)
    ];
function onCloseShare(){
    document.getElementById('share_image').style.display = 'none';
}