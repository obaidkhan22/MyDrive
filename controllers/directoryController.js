import { rm } from "fs/promises";
import { ObjectId } from "mongodb";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
export const getDirectory = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId.toString();
  const directoryData = await Directory.findOne({ _id }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }
  const files = await File.find({ parentDirId: directoryData._id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();
  return res.status(200).json({
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
};

export const addDir = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId
    ? new ObjectId(req.params.parentDirId)
    : user.rootDirId;

  const dirname = req.headers.dirname || "New Folder";
  try {
    const parentDir = await Directory.findById({
      _id: parentDirId,
    });

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    await Directory.insertOne({
      name: dirname,
      parentDirId,
      userId: user._id,
    });

    return res.status(200).json({ message: "Directory Created!" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const updateDirName = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;
  try {
    await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      { name: newDirName },
    );
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const dirId = new ObjectId(id) || req.user.rootDirId;
  const dirData = await Directory.findOne({ _id: id, userId: user._id }).select(
    "_id",
  );
  if (!dirData) return res.status(404).json({ error: "Directory not found." });
  const getDirContent = async (dirId) => {
    try {
      let files = await File.find({ parentDirId: dirId })
        .select("extension")
        .lean();
      let directories = await Directory.find({ parentDirId: dirId })
        .select("_id")
        .lean();
      for (const item of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirContent(item._id);
        files = [...files, ...childFiles];
        directories = [...directories, ...childDirectories];
      }
      return { files, directories };
    } catch (error) {
      return res.status(500).json({ error: "Unexpected Error" });
    }
  };

  try {
    const { files, directories } = await getDirContent(dirId);
    for (const { _id, extension } of files) {
      await rm(`./storage/${_id.toString()}${extension}`);
    }
    await File.deleteMany({ _id: { $in: [...files.map(({ _id }) => _id)] } });
    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), dirId] },
    });
    res.status(200).json({ message: "Directory deleted Successfully." });
  } catch (error) {
    next(error);
  }
};
