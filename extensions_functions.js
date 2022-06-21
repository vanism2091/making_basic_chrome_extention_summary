const selector = "selector", value = 1;


/**
 * Storage 사용하기
 * storage.sync
 * 1. storage에서 데이터 불러오기
 * 2. storage에 데이터 저장하기
 * 
 * storage.local 은 아래의 코드에서 sync -> local로 바꾼다.
 */
// 1
chrome.storage.sync.set({ "key1": "val1", "key2": "val2",
}, ()=>{
    // callback function
});
// 2
chrome.storage.sync.get(["key1", "key2"], (res)=>{
    // callback function
    console.log(res["key1"]);
});


/**
 * 탭과 관련된 액션들
 * 1. 현재 탭에서 특정 주소로 리다이렉트
 * 2. url이 특정 주소인 새로운 탭 생성 
 * 3. 특정 탭 닫기
 */
// 1
chrome.tabs.update({url: `https://...`,});
// 2
chrome.tabs.create({url: `https://...`});
// 3 현재 활성화된 탭 닫기
chrome.tabs.query({ currentWindow: true }, (tabs) => {  
    chrome.tabs.remove(tabs.filter(obj=> (obj.active==true))[0].id);
}); 


/**
 * 브라우저 내에서 js 실행
 * using
 * - 확장프로그램이 실행중인 페이지 내에서
 *      1. chrome.tabs.executeScript
 *          1. code string
 *          2. js file 
 * - 다른 탭에서
 *      3. 특정 탭을 찾아 js 실행
 *          executeScript(tab.id, {code: "", ...})
 */
// 1
chrome.tabs.executeScript({
    code:`[document.querySelector("#${selector}").click(),
        setTimeout(()=>{document.querySelector(".${selector}").click()}, 100)]`
})
// 2
chrome.tabs.executeScript({file: "filePath/fileName.js",});
// 3. 활성화된 탭들 중, 탭 이름에 "조건"이 들어간 탭을 찾아 코드 실행
chrome.tabs.query({ active: true }, (tabs) => {  
    chrome.tabs.executeScript(
        tabs.filter(o=> o.title.includes("조건"))[0].id, {
            code:`[document.querySelector("#${selector}").click()]`
        }
    );
});


/**
 * executeScript 동작 예시
 * dom 내의 노드 특정 후
 * 1. 클릭
 * 2. 특정 값 입력하기
 * 3. 클립보드에 저장된 값 입력하기
 * 4. 특정 값 가져와서 확장프로그램에 저장
 * 5. 노드의 값 클립보드에 저장
 * 6. 브라우저 콘솔에 출력
 */
chrome.tabs.executeScript({
    code:`[
        - 1
        document.querySelector("#${selector}").click(),
        - 2
        document.querySelector('#${selector}').value = "${value}",
        - 3
        t = document.createElement("input"), 
        document.body.appendChild(t), 
        t.focus(),
        document.execCommand("paste"), 
        clipboardText = t.value
        document.querySelector("#${selector}").value = clipboardText,
        - 4, 5
        코드 실행 방법 file로 file안에서 data 가공 후 이벤트 리스너에게 전달 후 데이터 저장 및 클립보드에 저장
        클립보드 저장은 document.execCommand("copy") 활용
        개발자 console에서 copy command가 되길래 확장프로그램에서도 될까 테스트해봤는데 안된다 :( 
        - 6
        console.log(${value})
    ]`
})


/**
 * 이벤트 리스너 등록 및 메세지 보내기
 * 1. 이벤트 리스너 등록
 * 2. 리스너에 메세지 보내기
 */
// background.js
response = { "response": "response" };
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const method = request["method"]
    if (method == "...") {
        // 원하는 작업
        const value = request["value"];
        const dict = {'key': "val"};
        // 작업이 끝나면 sendResponse
        sendResponse(dict);
    } else if (method == "...2"){
        sendResponse(response);
    } else sendResponse({});
  });
// some.js:
chrome.runtime.sendMessage(
    { method: "...", value: value },
    function (response) {
        // call back
        console.log(response);
    }
);


/**
 * 클립보드에 저장
 * 1. copyToClipboard 함수를 복사하길 원하는 string을 인수로 넘겨 호출한다. 
 */
function copyToClipboard(text) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
  

/**
 * 토스트 메세지
 * 1. html에 다음 삽입: <div id="toast"></div>
 * 2. js 함수 구현 
 */
// 2
let removeToast;

function toast(string) {
    const toast = document.getElementById("toast");

    toast.classList.contains("reveal") ?
        (clearTimeout(removeToast), removeToast = setTimeout(function () {
            document.getElementById("toast").classList.remove("reveal")
        }, 1000)) :
        removeToast = setTimeout(function () {
            document.getElementById("toast").classList.remove("reveal")
        }, 1000)
    toast.classList.add("reveal"),
        toast.innerText = string
}