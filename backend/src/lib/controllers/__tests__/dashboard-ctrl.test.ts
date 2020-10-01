import { Request, Response } from "express";
import { mocked } from "ts-jest/utils";
import { User } from "../../models/user";
import DashboardCtrl from "../dashboard-ctrl";
import DashboardFactory from "../../factories/dashboard-factory";
import DashboardRepository from "../../repositories/dashboard-repo";
import TopicAreaRepository from "../../repositories/topicarea-repo";
import AuthService from "../../services/auth";
import dashboardFactory from "../../factories/dashboard-factory";

jest.mock("../../services/auth");
jest.mock("../../repositories/dashboard-repo");
jest.mock("../../repositories/topicarea-repo");

const user: User = { userId: "johndoe" };
const repository = mocked(DashboardRepository.prototype);
const topicareaRepo = mocked(TopicAreaRepository.prototype);
const res = ({
  send: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as any) as Response;

beforeEach(() => {
  AuthService.getCurrentUser = jest.fn().mockReturnValue(user);
  DashboardRepository.getInstance = jest.fn().mockReturnValue(repository);
  TopicAreaRepository.getInstance = jest.fn().mockReturnValue(topicareaRepo);
});

describe("createDashboard", () => {
  let req: Request;
  beforeEach(() => {
    req = ({
      body: {
        topicAreaId: "abc",
        name: "test",
        description: "description test",
      },
    } as any) as Request;
  });

  it("returns a 401 error when user is not authenticated", async () => {
    AuthService.getCurrentUser = jest.fn().mockReturnValue(null);
    await DashboardCtrl.createDashboard(req, res);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith("Unauthorized");
  });

  it("returns a 400 error when topicAreaId is missing", async () => {
    delete req.body.topicAreaId;
    await DashboardCtrl.createDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required field `topicAreaId`");
  });

  it("returns a 400 error when name is missing", async () => {
    delete req.body.name;
    await DashboardCtrl.createDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required field `name`");
  });

  it("create the dashboard", async () => {
    const dashboard = DashboardFactory.createNew(
      "123 name",
      "abc",
      "abc name",
      "description test",
      user
    );
    DashboardFactory.createNew = jest.fn().mockReturnValue(dashboard);
    topicareaRepo.getTopicAreaById = jest.fn().mockReturnThis();
    await DashboardCtrl.createDashboard(req, res);
    expect(repository.putDashboard).toBeCalledWith(dashboard);
  });
});

describe("updateDashboard", () => {
  let req: Request;
  const now = new Date();
  jest.useFakeTimers("modern");
  jest.setSystemTime(now);
  beforeEach(() => {
    req = ({
      params: {
        id: "123",
      },
      body: {
        topicAreaId: "abc",
        name: "123 name",
        description: "description test",
        updatedAt: now.toISOString(),
      },
    } as any) as Request;
  });

  it("returns a 401 error when user is not authenticated", async () => {
    AuthService.getCurrentUser = jest.fn().mockReturnValue(null);
    await DashboardCtrl.updateDashboard(req, res);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith("Unauthorized");
  });

  it("returns a 400 error when id is missing", async () => {
    delete req.params.id;
    await DashboardCtrl.updateDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required field `id`");
  });

  it("returns a 400 error when name is missing", async () => {
    delete req.body.name;
    await DashboardCtrl.updateDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required body `name`");
  });

  it("returns a 400 error when topicAreaId is missing", async () => {
    delete req.body.topicAreaId;
    await DashboardCtrl.updateDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required body `topicAreaId`");
  });

  it("returns a 400 error when updatedAt is missing", async () => {
    delete req.body.updatedAt;
    await DashboardCtrl.updateDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required body `updatedAt`");
  });

  it("update the dashboard", async () => {
    const dashboard = DashboardFactory.create(
      "123",
      "123 name",
      "abc",
      "abc name",
      "description test",
      "Draft",
      user,
      now
    );
    topicareaRepo.getTopicAreaById = jest.fn().mockReturnThis();
    dashboardFactory.create = jest.fn().mockReturnValue(dashboard);
    await DashboardCtrl.updateDashboard(req, res);
    expect(repository.updateDashboard).toHaveBeenCalledWith(dashboard, user);
  });
});

describe("publishDashboard", () => {
  let req: Request;
  const now = new Date();
  jest.useFakeTimers("modern");
  jest.setSystemTime(now);
  beforeEach(() => {
    req = ({
      params: {
        id: "123",
      },
      body: {
        updatedAt: now.toISOString(),
      },
    } as any) as Request;
  });

  it("returns a 401 error when user is not authenticated", async () => {
    AuthService.getCurrentUser = jest.fn().mockReturnValue(null);
    await DashboardCtrl.publishDashboard(req, res);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith("Unauthorized");
  });

  it("returns a 400 error when id is missing", async () => {
    delete req.params.id;
    await DashboardCtrl.publishDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required field `id`");
  });

  it("returns a 400 error when updatedAt is missing", async () => {
    delete req.body.updatedAt;
    await DashboardCtrl.publishDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required body `updatedAt`");
  });

  it("update the dashboard", async () => {
    await DashboardCtrl.publishDashboard(req, res);
    expect(repository.publishDashboard).toHaveBeenCalledWith(
      "123",
      now.toISOString(),
      user
    );
  });
});

describe("deleteDashboard", () => {
  let req: Request;
  beforeEach(() => {
    req = ({
      params: {
        id: "090b0410",
      },
    } as any) as Request;
  });

  it("returns a 401 error when user is not authenticated", async () => {
    AuthService.getCurrentUser = jest.fn().mockReturnValue(null);
    await DashboardCtrl.deleteDashboard(req, res);
    expect(res.status).toBeCalledWith(401);
    expect(res.send).toBeCalledWith("Unauthorized");
  });

  it("returns a 400 error when id is missing", async () => {
    delete req.params.id;
    await DashboardCtrl.deleteDashboard(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith("Missing required field `id`");
  });

  it("deletes the dashboard", async () => {
    await DashboardCtrl.deleteDashboard(req, res);
    expect(repository.delete).toBeCalledWith("090b0410");
  });
});