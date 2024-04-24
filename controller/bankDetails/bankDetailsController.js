const BankDetails = require("../../model/bankDetailsSchema");
const GameStation = require("../../model/gsSchema");

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
    const bankDetails = await BankDetails.findOne({ gsId: gsId });

    if (!bankDetails) {
      return res.status(404).json({ success: false, message: 'Bank details not found' });
    }

    res.status(200).json({ success: true, bankDetails: bankDetails });
  } catch (error) {
    console.error("Error retrieving bank details:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  addBankDetails,
  getBankDetails
};
