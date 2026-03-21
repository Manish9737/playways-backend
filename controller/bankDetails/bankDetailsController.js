const BankDetails = require("../../model/bankDetailsSchema");
const GameStation = require("../../model/gsSchema");
const redis = require("../../config/redis");
const {parseJSON} = require("../../utils/helpers")

const BANK_DETAILS_CACHE_KEY = "bankDetails:all";

const addBankDetails = async (req, res) => {
  const { gsId } = req.params;
  const { accountHolderName, accountNumber, bankName, branch, ifscCode } =
    req.body;

  try {
    const host = await GameStation.findById(gsId);
    if (!host) {
      return res.status(404).json({ success: false, message: 'Host not found' });
    }

    const bankDetails = new BankDetails({
      gsId,
      accountHolderName,
      accountNumber,
      bankName,
      branch,
      ifscCode,
    });

    await bankDetails.save();

    await redis.del(BANK_DETAILS_CACHE_KEY);

    res
      .status(201)
      .json({ message: "Bank details added successfully", success: true });
  } catch (error) {
    console.error("Error adding bank details:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getBankDetails = async (req, res) => {
  const { gsId } = req.params;

  try {
    const cachedData = await redis.get(`${BANK_DETAILS_CACHE_KEY}:${gsId}`);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
        bankDetails: parseJSON(cachedData),
      });
    }

    const bankDetails = await BankDetails.findOne({ gsId: gsId });

    if (bankDetails) {
      await redis.set(`${BANK_DETAILS_CACHE_KEY}:${gsId}`, JSON.stringify(bankDetails), {
        ex: 60,
      });
    }

    if (!bankDetails) {
      return res.status(404).json({ success: false, message: 'Bank details not found' });
    }

    res.status(200).json({ success: true, source: "db", bankDetails: bankDetails });
  } catch (error) {
    console.error("Error retrieving bank details:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  addBankDetails,
  getBankDetails
};
