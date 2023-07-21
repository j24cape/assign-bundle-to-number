require("dotenv").config();

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

// サブアカウントをクロール
client.api.v2010.accounts
  .list()
  .then(async (accounts) => {
    for (let account of accounts) {
      if (account.status === "active") await execSubAccount(account);
    }
    console.log(`🐞 All done!`);
  })
  .catch((err) => {
    console.error(`*** ERROR ***\n${err}`);
  });

// サブアカウントごとに処理
const execSubAccount = async (account) => {
  console.log(`${account.friendlyName} [${account.sid}]==============`);
  const twilioClient = require("twilio")(account.sid, account.authToken);

  // すでに登録済みのBundlesを確認
  await twilioClient.numbers.v2.regulatoryCompliance.bundles
    .list({
      hasValidUntilDate: false,
      isoCountry: "JP",
      sortBy: "date-updated",
      sortDirection: "ASC",
      status: "twilio-approved"
    })
    .then(async (bundles) => {
      // すでにtwilio-approvedのBundleがある場合のみ対象にする
      if (bundles.length > 0)
        await setBundle(twilioClient, bundles);
    })
    .catch((err) => {
      console.error(`*** ERROR ***\n${err}`);
    });
};

// Bundleを電話番号に紐付ける
const setBundle = async (twilioClient, bundles) => {
  let nationalBundleSid = null; // BUxxxxxx
  let tollFreeBundleSid = null; // BUxxxxxx
  let nationalAddressSid = null; // ADxxxxxx
  let tollFreeAddressSid = null; // ADxxxxxx

  try {
    // 種別ごとのbundleSidとaddressSid取得
    for (let bundle of bundles) {
      await twilioClient.numbers.v2.regulatoryCompliance
        .regulations(bundle.regulationSid)
        .fetch()
        .then(async (regulation) => {
          if (regulation.numberType === "national") {
            nationalBundleSid = bundle.sid;
            await twilioClient.numbers.v2.regulatoryCompliance
              .bundles(bundle.sid)
              .itemAssignments.list()
              .then(async (items) => {
                for (let item of items) {
                  if (item.objectSid.startsWith("RD")) {
                    await twilioClient.numbers.v2.regulatoryCompliance
                      .supportingDocuments(item.objectSid)
                      .fetch()
                      .then((doc) => {
                        if (doc.type === "corporate_registry")
                          nationalAddressSid = doc.attributes.address_sids[0];
                      });
                  }
                }
              });
          }
          if (regulation.numberType === "toll-free") {
            tollFreeBundleSid = bundle.sid;
            await twilioClient.numbers.v2.regulatoryCompliance
              .bundles(bundle.sid)
              .itemAssignments.list()
              .then(async (items) => {
                for (let item of items) {
                  if (item.objectSid.startsWith("RD")) {
                    await twilioClient.numbers.v2.regulatoryCompliance
                      .supportingDocuments(item.objectSid)
                      .fetch()
                      .then((doc) => {
                        if (doc.type === "corporate_registry")
                          tollFreeAddressSid = doc.attributes.address_sids[0];
                      });
                  }
                }
              });
          }
        });
    }
    console.log(
      `🐞 National Bundle: ${nationalBundleSid} National Address: ${nationalAddressSid} TollFree Bundle: ${tollFreeBundleSid} TollFree Address: ${tollFreeAddressSid}`,
    );

    // 電話番号を取得
    await twilioClient.incomingPhoneNumbers.list().then(async (numbers) => {
      for (let number of numbers) {
        if (
          number.phoneNumber.startsWith("+8150") &&
          nationalBundleSid !== null &&
          nationalAddressSid !== null
        ) {
          // 国内電話番号
          await twilioClient.incomingPhoneNumbers(number.sid).update({
            bundleSid: nationalBundleSid,
            addressSid: nationalAddressSid,
          });
          console.log(
            `🐞 National Number ${number.phoneNumber} assigned to Bundle ${nationalBundleSid} Address ${nationalAddressSid}`,
          );
        } else if (
          (number.phoneNumber.startsWith("+81120") ||
            number.phoneNumber.startsWith("+81800")) &&
          tollFreeBundleSid !== null &&
          tollFreeAddressSid !== null
        ) {
          // トールフリー電話番号
          await twilioClient.incomingPhoneNumbers(number.sid).update({
            bundleSid: tollFreeBundleSid,
            addressSid: tollFreeAddressSid,
          });
          console.log(
            `🐞 Toll-Free Number ${number.phoneNumber} assigned to Bundle ${tollFreeBundleSid} Address ${tollFreeAddressSid}`,
          );
        }
      }
    });
  } catch (err) {
    console.error(`👺 ERROR: ${err}`);
  }
};
