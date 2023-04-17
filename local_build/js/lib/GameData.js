import ScenarioPlayer from "./ScenarioPlayer.js";
import { closeConfirm, openConfirm } from "./confirm.js";
import { CreateMap } from "./map.js";
import toDarking from "./toDarking.js";

/**
 * データ総数
 * @type {number}
 */
const dataLength = 20;
const yesButton = document.querySelector("#confirm-dialog-buttons .btn-yes");
const noButton = document.querySelector("#confirm-dialog-buttons .btn-no");
const closeButton = document.getElementById("game-data-close");
/**
 * ゲームのデータを参照渡しで保存
 */
let gameData = {};

/**
 * データの同期
 * @param {Object} gameState
 */
export const initGameData = (gameState) => {
  gameData = gameState;
};

/**
 * データの保存
 * @param {string} key
 * @param {string} value
 */
export const saveData = async (key, value) => {
  localStorage.setItem(key, value);
};

/**
 * データの呼び出し
 * @param {string} key
 * @returns
 */
export const loadData = async (key) => {
  return localStorage.getItem(key) || "";
};

/**
 * データの削除
 * @param {string} key
 */
export const removeData = async (key) => {
  localStorage.removeItem(key);
};

/**
 * セーブ画面起動
 * @param {"save" | "load"} type
 * @returns
 */
export const openGameDataScreen = async (type) => {
  if (!type || type === "") return;

  console.log(gameData);

  document.getElementById("game-data-title").innerHTML = `${
    type === "load" ? "ロード" : "セーブ"
  }するデータを選択してください。`;

  const template = document.getElementById("game-data-item-template");
  const list = document.getElementById("game-data-list");
  list.innerHTML = "";
  for (let i = 1; i <= dataLength; i++) {
    const data = await loadData("data-" + i);
    /**
     * @type {HTMLElement}
     */
    const item = template.content.cloneNode(true);
    item.querySelector(".game-data-name").innerHTML = `データ${i}`;

    const is_json_check = is_json(data);

    if (data !== "" && is_json_check) {
      const json = JSON.parse(data); // ここでJSONに変換できなくてエラーとか起こりそう
      // データがあった場合
      const name = json["charName"];
      const nowDate = json["nowDate"];
      item.querySelector(".game-data-content").innerHTML = `${name} ${nowDate}`;
      item.querySelector(".game-data-copy").classList.remove("default");
      item.querySelector(".game-data-reorder").classList.remove("default");
      item.querySelector(".game-data-delete").classList.remove("default");
    } else {
      // データがない場合
      item.querySelector(".game-data-content").innerHTML = `データがありません`;
      item.querySelector(".game-data-copy").classList.add("default");
      item.querySelector(".game-data-reorder").classList.add("default");
      item.querySelector(".game-data-delete").classList.add("default");

      // データの削除
      await removeData("data-" + i);
    }
    list.appendChild(item);
    const listItem = list.querySelectorAll(".game-data-item")[i - 1];
    const deleteButton = listItem.querySelector(".game-data-delete");

    listItem.addEventListener("click", () =>
      onClickItem(data === "" || !is_json_check, type, i)
    );
    deleteButton.addEventListener("click", (e) =>
      onClickDelete(e, data === "" || !is_json_check, type, i)
    );
  }

  closeButton.addEventListener("click", closeGameDataScreen);
  document.getElementById("game-data-screen").classList.remove("none");
};

/**
 * 閉じる
 */
export const closeGameDataScreen = () => {
  document.getElementById("game-data-screen").classList.add("none");
  closeButton.removeEventListener("click", closeGameDataScreen);
};

/**
 * セーブしますか？「はい」
 * @param {"save" | "load"} type
 * @param {number} no
 */
const dataConformYes = async (type, no) => {
  if (type === "save") {
    await saveData("data-" + no, JSON.stringify(gameData));
    closeConfirm();
    openGameDataScreen("save");
  }
  if (type === "load") {
    console.log(await loadData("data-" + no));
    const data = JSON.parse(await loadData("data-" + no));
    Object.keys(gameData).forEach((key) => {
      if (key === "nowPart") {
        gameData[key] = data["prevPart"];
      } else {
        gameData[key] = data[key];
      }
    });
    await toDarking(async (e) => {
      closeConfirm();
      closeGameDataScreen();
      await CreateMap(gameData);
      ScenarioPlayer.screenReset();
    }, gameData);
  }
};

/**
 *  アイテムをクリックした時（セーブ・ロードの確認）
 * @param {boolean} preventFlag
 * @param {"save" | "load"} type
 * @param {number} i
 */
const onClickItem = (preventFlag, type, i) => {
  if (preventFlag && type === "load") return;
  openConfirm(`${type === "load" ? "ロード" : "セーブ"}しますか？`);
  const execYes = () => {
    dataConformYes(type, i);
    removeEvent();
  };
  const execNo = () => {
    closeConfirm();
    removeEvent();
  };
  const removeEvent = () => {
    yesButton.removeEventListener("click", execYes);
    noButton.removeEventListener("click", execNo);
  };
  yesButton.addEventListener("click", execYes);
  noButton.addEventListener("click", execNo);
};

/**
 * 削除ボタン押した時
 * @param {Event} e
 * @param {boolean} preventFlag
 * @param {"save" | "load"} type
 * @param {number} i
 */
const onClickDelete = (e, preventFlag, type, i) => {
  if (preventFlag) return;
  e.stopPropagation(); // この順番でいい
  openConfirm(`データ${i}を削除しますか？`);
  const execYes = async () => {
    await removeData("data-" + i);
    closeConfirm();
    openGameDataScreen(type);
    removeEvent();
  };
  const execNo = () => {
    closeConfirm();
    removeEvent();
  };
  const removeEvent = () => {
    yesButton.removeEventListener("click", execYes);
    noButton.removeEventListener("click", execNo);
  };
  yesButton.addEventListener("click", execYes);
  noButton.addEventListener("click", execNo);
};

/**
 * JSONか判定
 * @param {string} str
 * @returns {boolean} `true`: JSONである, `false`: JSONでない
 */
export const is_json = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
