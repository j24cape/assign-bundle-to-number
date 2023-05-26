# Assign bundle to phone numbers

このプログラムは、Twilio Japan に対して承認された Bundle を既存の電話番号に自動で紐付けるものです。  
マスターアカウントの AccountSid、AuthToken を設定していただければ、保有しているサブアカウント（マスターを含む）を自動的にクロールして、保有している電話番号に Bundle を紐づけします。  
050 番号用の Bundle を、保有している 050 番号に、0120/0800 用の Bundle を、保有している 0120/0800 番号に適用します。

**[注意]**  
利用期限が設定されていない承認済みの Bundle がある場合にのみ、番号への紐づけを行います。Bundle が承認されていない場合は、事前に Bundle 承認作業を行ってください。  
承認済みの Bundle が複数ある場合は、どの Bundle を利用するかは不確定です。

## 前提条件

本プログラム以下の条件でのみ動作します。

- 法人での申請
- National（050 番号）、もしくは TollFree（0120/0800 番号）用の Bundle が承認済みになっていること
- Node.js がインストールされていること

## インストール

適当なフォルダに移動し、GitHub リポジトリを取得します。

```sh
git clone https://github.com/twilioforkwc/assign-bundle-to-number.git
cd assign-bundle-to-number
npm install
mv .env.example .env
```

## 環境変数の準備

`.env`ファイルをエディタで開き、以下の項目を変更します。

| 項目名      | 内容                                                                      |
| :---------- | :------------------------------------------------------------------------ |
| ACCOUNT_SID | Twilio アカウントのマスターアカウントの AccountSid（AC から始まる文字列） |
| AUTH_TOKEN  | AccountSid に対応する AuthToken                                           |

## プログラムの実行

```sh
npm start

アカウント名 [ACda0b1fcd0420d34db8bf22d108aaxxxx]==============
🐞 National Bundle: BU3c24cd1f18c4620426a83127d4a68697 National Address: ADcad44d633a8ac8acaa3e281be2c2e174 TollFree Bundle: null TollFree Address: null
🐞 National Number +815031452081 assigned to Bundle BU3c24cd1f18c4620426a83127d4a68697 Address ADcad44d633a8ac8acaa3e281be2c2e174
🐞 National Number +815032040671 assigned to Bundle BU3c24cd1f18c4620426a83127d4a68697 Address ADcad44d633a8ac8acaa3e281be2c2e174
サブアカウント名1 [ACbb7da0fdc805d15e90279a3b2974xxxx]==============
サブアカウント名2 [ACcbc2c456c2a98460998696ae70afxxxx]==============
🐞 All done!
```

上記のように`All done!`が表示されれば成功です。  
電話番号がないアカウントや、承認済みの Bundle がない場合は、そのアカウントはスキップされます。
