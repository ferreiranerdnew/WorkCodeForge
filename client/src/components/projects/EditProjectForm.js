import React, { useState } from "react";
import Button from "../button/Button";
import DatePicker from "react-date-picker";
import User from "../users/User";
import { BiEdit } from "react-icons/bi";
import getPreselectedProjectTeams from "../../helpers/getPreselectedProjectTeams";

function EditProjectForm(props) {
  const [name, setName] = useState(props.name || "");
  const [description, setDescription] = useState(props.description || "");
  const [startDate, setStartDate] = useState(
    new Date(props.startDate) || new Date()
  );
  const [endDate, setEndDate] = useState(new Date(props.endDate) || new Date());
  const [showUsers, setShowUsers] = useState(false);
  const [error, setError] = useState("");

  const { id, state, onSave } = props;

  const validate = () => {
    if (!!!name) {
      setError("Please enter a name");
      return;
    }
    if (!!!description) {
      setError("Please enter a description");
      return;
    }

    const selectedUsers = document
      .getElementById(makeId(id))
      .getElementsByClassName("user-list--selected");

    const selectedUsersIDs = [];

    for (const user of selectedUsers) {
      selectedUsersIDs.push(user.id);
    }

    const project = {
      name,
      description,
      startDate,
      endDate,
      selectedUsers: selectedUsersIDs,
    };

    setShowUsers(false);
    setError("");
    onSave(project, id);
    document.getElementById(makeId(id)).close();
  };

  const cancel = () => {
    setShowUsers(false);
    setError("");
    document.getElementById(makeId(id)).close();
  };

  const makeId = (id) => {
    return `dialog-dark-rounded-edit-project-${id}`;
  };

  return (
    <div>
      <div>
        <BiEdit
          className="edit-button"
          onClick={() => {
            setShowUsers(true);
            document.getElementById(makeId(id)).showModal();
          }}
        ></BiEdit>
      </div>
      <dialog className="nes-dialog is-dark is-rounded" id={makeId(id)}>
        <form
          className="form"
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          method="dialog"
        >
          {error && <p className="error">{error}</p>}
          <div className='form-label'>
            <label>
              <p>Project name:</p>
              <input
                value={name}
                type='text'
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={(ev) => {
                  if (
                    ev.code === 'Space' ||
                    ev.code === 'ArrowUp' ||
                    ev.code === 'ArrowDown' ||
                    ev.code === 'ArrowLeft' ||
                    ev.code === 'ArrowRight'
                  ) {
                    ev.stopPropagation();
                  }
                }}
              />
            </label>

            <label>
              <p>Description:</p>
              <textarea
                value={description}
                type='text'
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
                onKeyDown={(ev) => {
                  if (
                    ev.code === 'Space' ||
                    ev.code === 'ArrowUp' ||
                    ev.code === 'ArrowDown' ||
                    ev.code === 'ArrowLeft' ||
                    ev.code === 'ArrowRight'
                  ) {
                    ev.stopPropagation();
                  }
                }}
              />
            </label>
          </div>

          <div className="team-date-container">
            {showUsers && (
              <label>
                Team:
                <ul className="rpgui users-container">
                  {getPreselectedProjectTeams(state, id)}
                </ul>
              </label>
            )}

            <div className="date">
              <label>
                Start date:
                <DatePicker
                  onChange={setEndDate}
                  value={startDate}
                  className="date-size"
                />
              </label>

              <label>
                End date:
                <DatePicker
                  onChange={setEndDate}
                  value={endDate}
                  minDate={new Date(startDate)}
                  className="date-size"
                />
              </label>
            </div>
          </div>
          <div className="cancel-submit">
            <Button onClick={cancel} title={"cancel"}></Button>
            <Button onClick={validate} title={"submit"}></Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export default EditProjectForm;
