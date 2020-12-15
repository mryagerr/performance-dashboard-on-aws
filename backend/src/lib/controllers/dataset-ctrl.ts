import { Request, Response } from "express";
import AuthService from "../services/auth";
import DatasetRepository from "../repositories/dataset-repo";
import DatasetFactory from "../factories/dataset-factory";
import { SourceType } from "../models/dataset";
import { ItemNotFound } from "../errors";

async function listDatasets(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);

  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  const repo = DatasetRepository.getInstance();
  const datasets = await repo.listDatasets();
  res.json(datasets);
}

async function getDatasetById(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);
  if (!user) {
    res.status(401);
    return res.send("Unauthorized");
  }

  const { id } = req.params;
  const repo = DatasetRepository.getInstance();

  try {
    const dataset = await repo.getDatasetById(id);
    return res.json(dataset);
  } catch (err) {
    if (err instanceof ItemNotFound) {
      res.status(404);
      return res.send("Dataset not found");
    }
    throw err;
  }
}

async function createDataset(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);
  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  const { fileName, s3Key } = req.body;
  if (!fileName) {
    return res.status(400).send("Missing required field `fileName`");
  }

  if (!s3Key.raw || !s3Key.json) {
    return res.status(400).send("Missing required field `s3Key`");
  }

  try {
    const dataset = DatasetFactory.createNew({
      fileName,
      createdBy: user.userId,
      s3Key,
      sourceType: SourceType.FileUpload,
    });

    const repo = DatasetRepository.getInstance();
    await repo.saveDataset(dataset);
    res.json(dataset);
  } catch (err) {
    console.error(err);
    res.status(400).send("Unable to create dataset");
  }
}

export default {
  createDataset,
  listDatasets,
  getDatasetById,
};
