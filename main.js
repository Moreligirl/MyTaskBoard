const taskList = [];

const exampleTask = {
  description: "",
  due: new Date(Date.now())
};



function getTaskFromUserInput() {
  const taskDescription = document.getElementById("taskDescription").value;
  const dueDate = document.getElementById("dueDate").value;
  const dueTime = document.getElementById("dueTime").value;

  const timestamp = new Date(dueDate + " " + dueTime);

  const task = {
    description: taskDescription,
    dueDate: getDueDate(timestamp),
    dueTime: getDueTime(timestamp)
  };

  // console.log(task); // not needed
  return task;

}

function addTask() {

  clearInputValidityStatus();
  // validate
  const userInputIsValid = validateUserInput();
  // if invalid, dont continue
  if (!userInputIsValid) {
    return;
  }

  const task = getTaskFromUserInput();

  // reset form
  clearUserInput();

  addTaskToLocalStorage(task);

  // add task to DOM
  addTaskToDOM(task);
}

function addTaskToDOM(task) {

  // the container for placing all the task notes inside
  const taskContainer = document.getElementById("taskContainer");

  // create a task note element
  const note = document.createElement("div");
  note.classList.add("col-auto", "m-3", "note", "position-relative", "fade-in"); // add classes

  // create the remove button
  const removeTaskButton = document.createElement("button");
  removeTaskButton.classList.add("position-absolute", "remove-button", "btn", "btn-dark"); // add classes
  removeTaskButton.onclick = removeTask; // onclick
  removeTaskButton.innerHTML = `<i class="bi bi-x-lg"></i>`; // icon
  // add to the note element
  note.appendChild(removeTaskButton);


  // create the text section for the task description
  const taskDescriptionText = document.createElement("div");
  taskDescriptionText.classList.add("note-description", "p-0", "overflow-auto"); // classes
  taskDescriptionText.innerText = task.description; // text
  // add to the note element
  note.appendChild(taskDescriptionText);


  // create the text section for the date
  const taskDueDateText = document.createElement("div");
  taskDueDateText.classList.add("p-0", "note-timestamp"); // classes
  taskDueDateText.innerText = task.dueDate; // add the task's due date inside the date element
  // add to note
  note.appendChild(taskDueDateText);


  // create the text section for the time
  const taskDueTimeText = document.createElement("div");
  taskDueTimeText.classList.add("p-0", "note-timestamp"); //
  taskDueTimeText.innerText = task.dueTime; // add the task's due time inside the time element
  // add to note
  note.appendChild(taskDueTimeText);


  // add note to container
  taskContainer.appendChild(note);

}

function getTaskListFromLocalStorage() {

  // get JSON from local storage
  let taskListJSON = localStorage.getItem("taskList");
  // turn JSON string to array object
  let taskList = JSON.parse(taskListJSON);

  // if the user hasn't logged any tasks yet, the local storage would be empty
  if (taskList === null) {
    // if taskList doesn't exist, use an empty array to initialise it
    taskList = [];
  }

  return taskList;

}

// updates the value of taskList in local storage
function updateTaskListInLocalStorage(taskList) {

  // turn array to JSON
  let taskListJSON = JSON.stringify(taskList);

  // update local storage
  localStorage.setItem("taskList", taskListJSON);

}

// adds a task and updates local storage
function addTaskToLocalStorage(task) {

  // get taskList
  let taskList = getTaskListFromLocalStorage();

  // add task to array
  taskList.push(task);

  // update
  updateTaskListInLocalStorage(taskList);

}

// removes a task and updates local storage
function removeTaskFromLocalStorage(index) {

  // get taskList
  let taskList = getTaskListFromLocalStorage();

  // remove task from array
  taskList.splice(index, 1);

  // update
  updateTaskListInLocalStorage(taskList);
}

function removeTask(event) {

  // find which task was called
  const index = getElementIndexOfSelectedNote(event);

  // remove from local storage
  removeTaskFromLocalStorage(index);

  // remove from DOM
  removeTaskFromDOM(index);

}

function removeTaskFromDOM(index) {

  document.getElementById("taskContainer").children[index].remove();
}

function getElementIndexOfSelectedNote(event) {

  const selectedNote = event.currentTarget.parentElement;

  const noteList = document.getElementById("taskContainer").children;

  const index = Array.from(noteList).indexOf(selectedNote);

  return index;
}

function clearUserInput() {
  //

  document.getElementById("taskDescription").value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("dueTime").value = "";

  clearInputValidityStatus();

  document.getElementById("taskDescription").focus();
}

function clearInputValidityStatus() {

  //
  document.getElementById("taskDescription").classList.remove("is-invalid");
  document.getElementById("dueDate").classList.remove("is-invalid");
  document.getElementById("dueTime").classList.remove("is-invalid");

}

function validateUserInput(task) {
  //

  const taskDescription = document.getElementById("taskDescription").value;
  const dueTime = document.getElementById("dueTime").value;
  const dueDate = document.getElementById("dueDate").value;

  let userInputIsValid = true;

  if (taskDescription === "") {

    // description is empty
    userInputIsValid = false;
    // display error
    document.getElementById("taskDescription").classList.add("is-invalid");

  }

  if (dueTime === "") {

    // time empty
    userInputIsValid = false;
    // display error
    document.getElementById("dueTimeFeedback").innerText = "Please provide a due time.";
    document.getElementById("dueTime").classList.add("is-invalid");

  }

  if (dueDate === "") {

    // date empty
    userInputIsValid = false;
    // display error
    document.getElementById("dueDateFeedback").innerText = "Please provide a due date.";
    document.getElementById("dueDate").classList.add("is-invalid");

  } else {

    // is now >= due date+time?
    // if true: date overdue
    // is now date only == due date only?
    // is true: time overdue too

    const currentTimestamp = new Date();
    const dueTimestamp = new Date(`${dueDate} ${dueTime}`);


    if (currentTimestamp.getTime() > dueTimestamp.getTime()) {


      // for sure overdue
      userInputIsValid = false;


      // check for time
      // we will alter the timestamps by setting them to midnight
      currentTimestamp.setHours(0, 0, 0, 0);
      dueTimestamp.setHours(0, 0, 0, 0);

      if (currentTimestamp.getTime() === dueTimestamp.getTime()) { // if today
        //
        if (dueTime !== "") {
          // time invalid

          document.getElementById("dueTimeFeedback").innerText = "This time has passed already!";
          document.getElementById("dueTime").classList.add("is-invalid");
          // date valid

        }
        // else - already invalid bc of empty time

      } else { // not today

        // date invalid
        document.getElementById("dueDateFeedback").innerText = "This date has passed already!";
        document.getElementById("dueDate").classList.add("is-invalid");

      }

    }

  }

  // at this point, if there was an invalid input, userInputIsValid would be set to false
  return userInputIsValid;
}



/* DATE AND TIME FORMATTING FUNCTIONS */

// gets a Date object as a parameter and returns a formatted date string
function getDueDate(timestamp) {

  // formatting options for date to show leading zeroes, in a shortened format
  const dateFormattingOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };

  const dueDate = timestamp.toLocaleDateString(undefined, dateFormattingOptions); // the first parameter is undefined so that the date displays according to local standards

  return dueDate;
}

// gets a Date object as a parameter and returns a formatted time string
function getDueTime(timestamp) {

  // format time to show hour and minute only, with leading zeroes
  const timeFormattingOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  const dueTime = timestamp.toLocaleTimeString(undefined, timeFormattingOptions); // the first parameter is undefined so that the time displays according to local standards

  return dueTime;
}


function displayAllTasks() {

  // display all notes
  const taskList = getTaskListFromLocalStorage();

  taskList.forEach(
    (task) => {
      addTaskToDOM(task);
    }
  );
}

function setMinimumDateForToday() {

  // set min date in input
  document.getElementById("dueDate").setAttribute("min", new Date().toISOString().slice(0, 10));
}

document.addEventListener("DOMContentLoaded", displayAllTasks);
// document.addEventListener("DOMContentLoaded", setMinimumDateForToday);
