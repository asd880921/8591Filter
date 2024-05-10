var loadView = CreateLoading(); //設定載入畫面
var btn_Filter = CreateBtn_Filter(); //設定過濾按鈕

// 監聽事件
btn_Filter.addEventListener('click', function() {
    showLoading('正在過濾中，請稍後...', loadView, true);
    // 將頁面滾動至底部
    scrollToBottomSmoothly();
    // 延遲執行main
    setTimeout(main, 500);
});

// 監聽事件
document.addEventListener('mousedown', function(event) {
    if (event.target.classList.contains('pageNum') || event.target.classList.contains('last01') || event.target.classList.contains('next01')) {
        setTimeout(function() {
            showBlackUser(); //觸發換頁時 需將黑名單隱藏的用戶顯示 以免畫面重用混淆
        }, 250);
    }
});


// Main方法
async function main() {
    console.log("開始過濾");
    var blacklist;
    // 從 Chrome 儲存中取得資料
    let { reviewFilter } = await chrome.storage.sync.get(['reviewFilter']);
    if (reviewFilter === undefined) {
        reviewFilter = "";
    }
    // 從結果中取得 reviewFilter 的值
    var blacklist = reviewFilter.trim().split('\n');

    showBlackUser(); //先將黑名單隱藏的用戶顯示 以免畫面重用混淆
    var count = hideBlackUser(blacklist); //隱藏黑名單用戶

    showLoading('已過濾' + count + '名黑名單用戶!', loadView, true);
    setTimeout(function() {
        showLoading('', loadView, false);
        console.log("過濾結束!");
    }, 1250);
}

// 隱藏黑名單賣場方法
function hideBlackUser(blacklist) {
    var count = 0;
    var elements = document.querySelectorAll('.list-item.flex.cursor');
    elements.forEach(function(element) {
        // 檢查是否包含指定的子元素
        var childElement = element.querySelector('a[data-fuid]');
        if (!childElement) {
            return;
        }
        var dataFuid = childElement.getAttribute('data-fuid');
        if (blacklist.includes(dataFuid)) {
            element.style.display = 'none';
            count++;
        }
    });
    console.log("已將黑名單用戶隱藏!");
    return count;
}

// 解除隱藏黑名單
function showBlackUser() {
    var elements = document.querySelectorAll('.list-item.flex.cursor');
    elements.forEach(function(element) {
        var displayStyle = window.getComputedStyle(element).getPropertyValue('display');
        if (displayStyle === 'none') {
            element.removeAttribute('style');
        }
    });
     console.log("解除隱藏!");
}

// 設定過濾按鈕
function CreateBtn_Filter() {
    // 创建按钮元素
    var button = document.createElement('button');
    button.textContent = '賣場過濾';
    button.style.position = 'fixed';
    button.style.top = '50px';
    button.style.right = '50px';
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // 黑色半透明背景
    button.style.color = '#fff'; // 文字白色
    button.style.fontSize = '14px';
    button.style.border = 'none'; // 去除邊框
    button.style.borderRadius = '5px'; // 圓角
    button.style.padding = '10px 20px'; // 內編劇
    button.style.cursor = 'pointer'; // 滑鼠樣式
    document.body.appendChild(button);
    return button;
};

// 設定載入視窗
function CreateLoading() {
    // 建立載入畫面
    var loadView = document.createElement('div'); //創建載入DIV
    loadView.innerHTML = '正在過濾中，請稍後...';
    loadView.style.color = '#ffffff'; // TEXT白色
    loadView.style.fontSize = '15px';
    loadView.style.position = 'fixed';
    loadView.style.bottom = '20%'; // 位於頁面下方 80%
    loadView.style.left = '50%';
    loadView.style.transform = 'translate(-50%, 0)'; // 水平居中
    loadView.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // 半透明黑色背景
    loadView.style.padding = '20px';
    loadView.style.borderRadius = '5px';
    loadView.style.zIndex = '9999';
    document.body.appendChild(loadView);
    loadView.style.display = 'none';
    return loadView;
}

// 載入畫面顯示
function showLoading(text, loadView, flag) {
    if (!flag) {
        loadView.style.display = 'none';
        return;
    }
    loadView.innerHTML = text;
    loadView.style.display = 'block';
}

// 平滑地将页面滚动到底部
function scrollToBottomSmoothly() {
    var scrollHeight = document.documentElement.scrollHeight;
    var currentScroll = window.scrollY || window.pageYOffset;
    var start = performance.now();

    function scrollStep(timestamp) {
        var time = timestamp - start;
        var percent = Math.min(time / 200, 1);

        window.scrollTo(0, currentScroll + percent * (scrollHeight - currentScroll));

        if (time < 200) {
            window.requestAnimationFrame(scrollStep);
        }
    }

    window.requestAnimationFrame(scrollStep);
}