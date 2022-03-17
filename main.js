/* Basic Functions */

function getTaskFromUserInput() {
  const taskDescription = document.getElementById("taskDescription").value;
  const dueDate = document.getElementById("dueDate").value;
  const dueTime = document.getElementById("dueTime").value;

  const timestamp = new Date(`${dueDate}T${dueTime}`);

  const task = {
    description: taskDescription,
    dueDate: getFormattedDueDate(timestamp),
    dueTime: getFormattedDueTime(timestamp)
  };
  return task;
}

function addTask() {
  // reset invalid status before validating so that corrected fields will not be marked invalid
  clearInputValidityStatus();

  const userInputIsValid = validateUserInput();
  // if invalid input, dont continue
  if (!userInputIsValid) {
    return;
  }
  // if we got here, the input is valid
  const task = getTaskFromUserInput();

  addTaskToLocalStorage(task);
  addTaskToDOM(task);

  // reset form
  clearUserInput();
}

function removeTask(event) {
  // find which task was called
  const index = getElementIndexOfSelectedNote(event);

  // remove that task
  removeTaskFromLocalStorage(index);
  removeTaskFromDOM(index);
}



// Functions responsible for DOM and visual display

function addTaskToDOM(task) {
  // the container for placing all the task notes inside
  const taskContainer = document.getElementById("taskContainer");

  // create a task note element
  const taskNote = document.createElement("div");
  taskNote.classList.add("col-auto", "m-3", "note", "position-relative", "fade-in"); // add classes

  // create the remove button
  const removeTaskButton = document.createElement("button");
  removeTaskButton.classList.add("position-absolute", "remove-button", "btn", "btn-dark"); // add classes
  removeTaskButton.onclick = removeTask; // add button action
  removeTaskButton.innerHTML = `<i class="bi bi-x-lg"></i>`; // icon
  // add to the note element
  taskNote.appendChild(removeTaskButton);

  // create the text section for the task description
  const taskDescriptionText = document.createElement("div");
  taskDescriptionText.classList.add("note-description", "p-0", "overflow-auto"); // classes
  taskDescriptionText.innerText = task.description; // add the task description text
  // add to the note element
  taskNote.appendChild(taskDescriptionText);

  // create the text section for the date
  const taskDueDateText = document.createElement("div");
  taskDueDateText.classList.add("p-0", "note-timestamp"); // classes
  taskDueDateText.innerText = task.dueDate; // add the task's due date inside the date element
  // add to note
  taskNote.appendChild(taskDueDateText);

  // create the text section for the time
  const taskDueTimeText = document.createElement("div");
  taskDueTimeText.classList.add("p-0", "note-timestamp");
  taskDueTimeText.innerText = task.dueTime; // add the task's due time inside the time element
  // add to note
  taskNote.appendChild(taskDueTimeText);

  // add finished note to container
  taskContainer.appendChild(taskNote);
}

function removeTaskFromDOM(index) {
  // find the note and remove it
  document.getElementById("taskContainer").children[index].remove();
}

function getElementIndexOfSelectedNote(event) {
  // the current target is the remove button, the selected note would be its parent
  const selectedNote = event.currentTarget.parentElement;

  const noteList = document.getElementById("taskContainer").children;
  // find our note in the list of all notes
  const index = Array.from(noteList).indexOf(selectedNote);

  return index;
}

function displayAllTasks() {
  const taskList = getTaskListFromLocalStorage();
  // go over the list and display every note
  taskList.forEach(addTaskToDOM);
}



/* functions responsible for local storage */

function updateTaskListInLocalStorage(taskList) {

  // turn array to JSON
  let taskListJSON = JSON.stringify(taskList);

  // update local storage
  localStorage.setItem("taskList", taskListJSON);

}

function addTaskToLocalStorage(task) {

  let taskList = getTaskListFromLocalStorage();

  // add task to array
  taskList.push(task);

  // update new array
  updateTaskListInLocalStorage(taskList);
}

function removeTaskFromLocalStorage(index) {

  let taskList = getTaskListFromLocalStorage();

  // remove task from array
  taskList.splice(index, 1);

  // update new array
  updateTaskListInLocalStorage(taskList);
}

function getTaskListFromLocalStorage() {

  const taskListJSON = localStorage.getItem("taskList");
  // if the user hadn't logged any tasks yet, the local storage would be empty

  if (taskListJSON === null) {
    // since the user hadn't logged any tasks, the list should be empty
    return [];

  } else {
    // turn JSON string to array object and return it
    const taskList = JSON.parse(taskListJSON);
    return taskList;
  }
}



// form validation

function validateUserInput() {
  // we're going to assume the input is valid, and try to disprove it
  let userInputIsValid = true;

  // check each field if it's empty or not; display an appropriate message if it is
  const taskDescriptionIsEmpty = checkIfInputFieldIsEmpty("taskDescription");
  const dueTimeIsEmpty = checkIfInputFieldIsEmpty("dueTime");
  const dueDateIsEmpty = checkIfInputFieldIsEmpty("dueDate");

  // if any of the fields are empty, the user input is invalid
  if (taskDescriptionIsEmpty || dueTimeIsEmpty || dueDateIsEmpty) {
    userInputIsValid = false;
  }
  // since we have a date, we can do an additional check for if it has passed already
  if (!dueDateIsEmpty) {
    const userInputIsOverDue = checkIfUserInputIsOverdue();

    if (userInputIsOverDue) {
      userInputIsValid = false;
    }
  }
  // at this point, if there was an invalid input, userInputIsValid would have been set to false.
  return userInputIsValid;
}

function checkIfInputFieldIsEmpty(inputFieldId) {

  const inputField = document.getElementById(inputFieldId);

  if (inputField.value === "") {
    // if field is empty, display appropriate message
    displayFeedbackForInvalidUserInput(inputFieldId, `Please provide a ${inputField.ariaLabel}.`);
    return true;
  }
  // if we got here, field is not empty
  return false;
}

function checkIfUserInputIsOverdue() {
  // first of all we need to get the values
  const dueDate = document.getElementById("dueDate").value; // is definitely NOT empty
  const dueTime = document.getElementById("dueTime").value; // may or may not be empty

  // if dueTime is empty, replace it with 00:00 so that we can compare just the date
  const dueDateTimeAsISOString = `${dueDate}T${ dueTime ? dueTime : "00:00" }`;
  // create date objects for easy comparison
  const currentTimestamp = new Date();
  const dueTimestamp = new Date(dueDateTimeAsISOString);

  if (currentTimestamp.getTime() > dueTimestamp.getTime()) {
    // either dueDate or dueTime are for sure overdue, check which one

    // set time to midnight so that we can compare just the dates
    currentTimestamp.setHours(0, 0, 0, 0);
    dueTimestamp.setHours(0, 0, 0, 0);
    // check if the inputted date is the current date
    if (currentTimestamp.getTime() === dueTimestamp.getTime()) {
      // due date is today, therefore it is valid; which means either the due time is overdue, or the field was empty.
      if (dueTime !== "") {
        // if the due time is not empty, it's definitely overdue.
        displayFeedbackForInvalidUserInput("dueTime", "This time has passed already!");
      }
    } else {
      // if the due date is not today, it has to be a past date which means it is overdue.
      displayFeedbackForInvalidUserInput("dueDate", "This date has passed already!");
    }

    // whether it's the time or date, the user input is definitely overdue.
    return true;
  }
  // if we got here, that means the user input is not overdue
  return false;
}

function displayFeedbackForInvalidUserInput(inputField, message) {
  // update correct message
  document.getElementById(`${inputField}Feedback`).innerText = message;
  // mark field invalid to display message
  document.getElementById(inputField).classList.add("is-invalid");
}



// functions responsible for controlling inputs

function clearUserInput() {
  // clear the values
  document.getElementById("taskDescription").value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("dueTime").value = "";
  // clear the invalid appearance
  clearInputValidityStatus();
}

function clearInputValidityStatus() {
  // the input is marked invalid by adding the is-invalid class, so just remove it
  document.getElementById("taskDescription").classList.remove("is-invalid");
  document.getElementById("dueDate").classList.remove("is-invalid");
  document.getElementById("dueTime").classList.remove("is-invalid");
}



// utility stuff

function getFormattedDueDate(timestamp) {

  // formatting options for date to show leading zeroes, in a shortened format
  const dateFormattingOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };

  const dueDate = timestamp.toLocaleDateString(undefined, dateFormattingOptions); // the first parameter is undefined so that the date displays according to local standards

  return dueDate;
}

function getFormattedDueTime(timestamp) {

  // format time to show hour and minute only, with leading zeroes
  const timeFormattingOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  const dueTime = timestamp.toLocaleTimeString(undefined, timeFormattingOptions); // the first parameter is undefined so that the time displays according to local standards

  return dueTime;
}

function setMinimumDateForToday() {
  const currentTime = new Date();
  // get the date portion of the ISO string (start - "T")
  const minimumDate = currentTime.toISOString().split("T")[0];
  // set min date in input
  document.getElementById("dueDate").setAttribute("min", minimumDate);
}

function refocusOnTaskDescriptionInputField(event) {
  // we only want the focus to happen if the user is not currently focused on another input field
  if (!event.target.matches(".form-control")) {
    // user is not focused on another input field
    document.getElementById("taskDescription").focus();
  }
}



// event listeners

document.addEventListener("DOMContentLoaded", displayAllTasks);
document.addEventListener("DOMContentLoaded", setMinimumDateForToday);
document.addEventListener("keydown", refocusOnTaskDescriptionInputField);
