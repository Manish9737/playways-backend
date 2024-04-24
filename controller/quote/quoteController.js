const Qoute = require("../../model/quoteSchema");

const addQuotes = async (req, res, next) => {
  const { name, quote } = req.body;

  if (!name || !quote) {
    return res.status(422).json({ error: "Please fill the fields properly." });
  }

  try {
    const quoteExist = await Qoute.findOne({ quote: quote });

    if (quoteExist) {
      return res.status(422).json({ error: "Quote already Exist." });
    } else {
      const quotes = new Qoute({ name, quote });

      await quotes.save();
      return res
        .status(200)
        .json({ message: "Quote is saved successfully.", success: true });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getallQuotes = async (req, res, next) => {
  try {
    const quotes = await Qoute.find();

    res.status(200).json({ quotes });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const updateQuote = async (req, res, next) => {
  const quoteId = req.params.id;
  const { name, quote } = req.body;

  try {
    const updatedQuote = await Qoute.findByIdAndUpdate(
      quoteId,
      { name, quote },
      { new: true }
    );

    if (!updatedQuote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    return res
      .status(200)
      .json({ message: "Quote updated successfully", quote: updatedQuote });
  } catch (error) {
    console.error("Error updating quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteQuote = async (req, res, next) => {
  const quoteId = req.params.id;

  try {
    const deletedQuote = await Qoute.findByIdAndDelete(quoteId);

    if (!deletedQuote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    return res
      .status(200)
      .json({ message: "Quote deleted successfully", quote: deletedQuote });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addQuotes,
  getallQuotes,
  updateQuote,
  deleteQuote,
};
