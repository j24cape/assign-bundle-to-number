require("dotenv").config();
const chai = require("chai");
const assert = chai.assert;
const fs = require("fs");
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN,
);

describe(".env test", () => {
  it("ACCOUNT_SID", () => {
    assert.lengthOf(process.env.ACCOUNT_SID, 34, "ACCOUNT_SIDの長さが不正です");
    assert.equal(
      process.env.ACCOUNT_SID.slice(0, 2),
      "AC",
      "ACCOUNT_SIDの形式が不正です",
    );
  });
  it("AUTH_TOKEN", () => {
    assert.lengthOf(process.env.AUTH_TOKEN, 32, "AUTH_TOKENの長さが不正です");
  });
  it("API Call", async () => {
    await client.api
      .accounts(process.env.ACCOUNT_SID)
      .fetch()
      .then((account) => {
        assert.strictEqual(
          account.status,
          "active",
          "アカウントがアクティブではありません",
        );
      })
      .catch((err) => {
        throw `API Call failed. ${err}`;
      });
  });
});
