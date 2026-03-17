const Slot = require("../../model/slotsSchema");

const addSlots = async (req, res, next) => {
  const { gsid } = req.params;
  try {
    const slotsData = req.body.slots;

    const createdSlots = [];

    for (const slotData of slotsData) {
      if (!slotData.gameid || !slotData.date) {
        return res
          .status(400)
          .json({ message: "gameid and date are required for each slot" });
      }

      const newSlot = await Slot.create({
        gsid: gsid,
        gameid: slotData.gameid,
        date: slotData.date,
        slots: slotData.slots,
      });

      createdSlots.push(newSlot);
    }

    res.status(201).json({ slots: createdSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateSlots = async (req, res, next) => {
  const { gsid } = req.params;
  try {
    const slotsData = req.body.slots;

    const updatedSlots = [];

    for (const slotData of slotsData) {
      if (!slotData._id || !slotData.gameid || !slotData.date) {
        return res.status(400).json({
          message: "_id, gameid, and date are required for each slot",
        });
      }

      const existingSlot = await Slot.findOne({
        _id: slotData._id,
        gsid: gsid,
      });

      if (!existingSlot) {
        return res.status(404).json({ message: "Slot not found" });
      }

      const updatedSlotData = slotData.slots.map(async (slot) => {
        const existingSlotIndex = existingSlot.slots.findIndex(
          (s) => String(s._id) === String(slot._id)
        );

        if (existingSlotIndex === -1) {
          return res.status(404).json({ message: "Slot not found" });
        }

        const updatedFields = {};
        let isDataChanged = false;

        for (const key in slot) {
          if (existingSlot.slots[existingSlotIndex][key] !== slot[key]) {
            updatedFields[`slots.${existingSlotIndex}.${key}`] = slot[key];
            isDataChanged = true;
          }
        }

        if (isDataChanged) {
          const updatedSlot = await Slot.findOneAndUpdate(
            { _id: slotData._id, gsid: gsid },
            { $set: updatedFields },
            { new: true }
          );
          return updatedSlot.slots[existingSlotIndex];
        } else {
          return existingSlot.slots[existingSlotIndex];
        }
      });

      const updatedSlot = await Promise.all(updatedSlotData);
      updatedSlots.push(updatedSlot);
    }

    res.json({ slots: updatedSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteSlots = async (req, res, next) => {
  const { gsid } = req.params;
  const { slotId } = req.body;

  try {
    if (!slotId) {
      return res
        .status(400)
        .json({ message: "Slot ID is required for deletion" });
    }

    const existingSlot = await Slot.findOne({ _id: slotId, gsid: gsid });

    if (!existingSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    await Slot.deleteOne({ _id: slotId, gsid: gsid });

    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const fetchdataOfSlot = async (req, res, next) => {
  const { slotId } = req.params;
  try {
    const slot = await Slot.findOne({ "slots._id": slotId });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const foundSlot = slot.slots.find((s) => String(s._id) === slotId);

    if (!foundSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ slot: foundSlot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateSlot = async (req, res, next) => {
  const { slotId } = req.params;
  const updateData = req.body;

  try {
    const slot = await Slot.findOne({ "slots._id": slotId });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const foundSlotIndex = slot.slots.findIndex(
      (s) => String(s._id) === slotId
    );

    if (foundSlotIndex === -1) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const updatedSlot = {
      ...slot.slots[foundSlotIndex].toObject(),
      ...updateData,
    };

    slot.slots.set(foundSlotIndex, updatedSlot);

    await slot.save();

    res.json({ slot: updatedSlot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteSlot = async (req, res, next) => {
  const { slotId } = req.params;

  try {
    const slot = await Slot.findOne({ "slots._id": slotId });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const foundSlotIndex = slot.slots.findIndex(
      (s) => String(s._id) === slotId
    );

    if (foundSlotIndex === -1) {
      return res.status(404).json({ message: "Slot not found" });
    }

    Object.keys(updateData).forEach((key) => {
      slot.slots[foundSlotIndex][key] = updateData[key];
    });

    await slot.save();

    res.json({
      message: "Slot deleted successfully",
      slot: slot.slots[foundSlotIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllSlots = async (req, res, next) => {
  try {
    const slots = await Slot.find();
    res.json({ slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const findSlotByBookingId = async (req, res, next) => {
  const { bookingId } = req.params;

  try {
    const slot = await Slot.findOne({ "slots.bookingid": bookingId });

    if (!slot) {
      return res
        .status(404)
        .json({ message: "Slot not found for the booking ID" });
    }

    const foundSlot = slot.slots.find((s) => String(s.bookingid) === bookingId);

    if (!foundSlot) {
      return res
        .status(404)
        .json({ message: "Slot not found for the booking ID" });
    }

    res.json({ slot: foundSlot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  addSlots,
  getAllSlots,
  findSlotByBookingId,

  fetchdataOfSlot,
  updateSlot,
  deleteSlot,

  updateSlots,
  deleteSlots,
};
