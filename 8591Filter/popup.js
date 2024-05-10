const $userInput = document.querySelector('#userInput');
const $blacklist = document.getElementById('blacklist');
const $addUser = document.getElementById('addUser');
const importButton = document.getElementById('importButton');
const importData = document.getElementById('importData');
const exportButton = document.getElementById('exportButton');

// 匯入按鈕
importButton.addEventListener('click', () => {importData.click();});
// 監聽按鈕 (匯入按鈕)
importData.addEventListener('input', importUser);
function importUser(event) {
  const file = event.target.files[0];
  if (!file) return; 

  if (file.type !== 'text/plain' || !file.name.endsWith('.txt')) {
      alert('請選擇TXT文檔!');
      // 清除文件選擇器內容
      importData.value = '';
      return;
  }

  // 讀取文本內容
  const reader = new FileReader();
  reader.onload = function(event) {
      const content = event.target.result;
      const lines = content.split('\n').map(line => line.trim());
      if (!lines || lines.length === 0) {
        alert('不可上傳空白文件!');
        // 清除文件選擇器內容
        return;
      }

      const confirmed = window.confirm('匯入後將會清除原有資料，是否繼續?');
      if (confirmed) {
        chrome.storage.sync.set({ listUser: lines });
        fetchData();
      }
  };
  reader.readAsText(file);
}

// 匯出按鈕
exportButton.addEventListener('click', exportUser);
async function exportUser() {
  let { listUser } = await chrome.storage.sync.get(['listUser']);
  
  if (!listUser || listUser.length === 0) {
    alert("無資料可匯出!");
    return;
  }

  // 將列表轉換為字符串，每個用戶一行
  const content = listUser.join('\n');
  // 創建一個 Blob 對象，並指定 MIME 類型為 plain/text
  const blob = new Blob([content], { type: 'plain/text' });

  // 創建一個下載鏈接
  const url = URL.createObjectURL(blob);
  
  // 創建一個下載標籤
  const a = document.createElement('a');
  a.href = url;
  a.download = 'blacklist.txt'; // 指定下載文件的文件名
  a.click();

  // 釋放對象 URL，以便瀏覽器能夠正確管理內存
  URL.revokeObjectURL(url);
}




// 監聽按鈕 (新增用戶)
$addUser.addEventListener('click', addUser);

//新增用戶
function addUser() {
  const username = $userInput.value.trim();
  if (username) {
    // 檢查重複內容
    const existingUser = Array.from($blacklist.querySelectorAll('li span')).find(span => span.textContent.trim() === username);
    if (existingUser) {
      alert('該用戶已存在至黑名單中!');
      return;
    }
    // 創建列表項和刪除按鈕
    const $listItem = document.createElement('li');
    // 創建ID
    const $usernameElement = document.createElement('span');
    $usernameElement.textContent = username;
    //刪除按鈕
    const $deleteButton = document.createElement('button');
    $deleteButton.style.marginRight = '5px'; // 邊距
    $deleteButton.textContent = '刪除';
    $deleteButton.addEventListener('click', function() {
        $listItem.remove();
        updateUserList();
    });

    // 將ID 和 按鈕 添加到清單當中
    $listItem.appendChild($deleteButton);
    $listItem.appendChild($usernameElement);
    $blacklist.appendChild($listItem);

    // 清除輸入框
    $userInput.value = '';

    updateUserList();
  }
}

function updateUserList() {
  const listItems = $blacklist.querySelectorAll('li');
  const userList = Array.from(listItems).map(item => {
      // 獲取ID用戶元素的內容
      const username = item.querySelector('span').textContent;
      return username.trim();
  });
  chrome.storage.sync.set({ listUser: userList });
}

async function fetchData() {
  $blacklist.innerHTML = '';

  let { listUser } = await chrome.storage.sync.get(['listUser']);

  if (!listUser || listUser.length === 0) {
    listUser = [];
  }

  listUser.forEach(username => {
    // 創建列表項和刪除按鈕
    const $listItem = document.createElement('li');
    // 創建ID
    const $usernameElement = document.createElement('span');
    $usernameElement.textContent = username
    //刪除按鈕
    const $deleteButton = document.createElement('button');
    $deleteButton.style.marginRight = '5px'; // 邊距
    $deleteButton.textContent = '刪除';
    $deleteButton.addEventListener('click', function() {
      // 點擊刪除按鈕，清除頁面上對應的資料項，並從 listUser 清除對應用戶
      $listItem.remove();
      listUser.splice(listUser.indexOf(username), 1);
      // 更新listUser
      chrome.storage.sync.set({ listUser: listUser });
    });

    // 將ID 和 按鈕 添加到清單當中
    $listItem.appendChild($deleteButton);
    $listItem.appendChild($usernameElement);
    $blacklist.appendChild($listItem);
  });
}


// 由於每次重新打開 popup，就等同打開新視窗，所以使用 onload 重新取得資料
window.onload = () => {
  fetchData();
}