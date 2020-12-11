import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import EnvConfig from "../../services/EnvConfig";
import BackendService from "../../services/BackendService";
import EditTopicArea from "../EditTopicArea";

jest.mock("../../services/BackendService");
jest.mock("../../hooks");

const topicAreaId = "123456789";

beforeEach(() => {
  BackendService.renameTopicArea = jest.fn();

  const history = createMemoryHistory();
  history.push(`/admin/settings/topicarea/${topicAreaId}/edit`);

  render(
    <Router history={history}>
      <Route path="/admin/settings/topicarea/:topicAreaId/edit">
        <EditTopicArea />
      </Route>
    </Router>
  );
});

test("saves the new topic area name", async () => {
  const nameInput = screen.getByLabelText(`${EnvConfig.topicAreaLabel} name`);
  fireEvent.input(nameInput, {
    target: {
      value: "New topic area name",
    },
  });

  const submitBtn = screen.getByRole("button", { name: "Save" });
  await act(async () => {
    fireEvent.click(submitBtn);
  });

  expect(BackendService.renameTopicArea).toBeCalledWith(
    topicAreaId,
    "New topic area name"
  );
});