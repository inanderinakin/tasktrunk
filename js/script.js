function loadScript(src) {
    const script = document.createElement("script");
    script.src = src;
    document.head.prepend(script);
}

loadScript("https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js")


function saveTasksToLocalStorage() {
    const taskList = document.getElementById('taskList');
    const finishedList = document.getElementById('finishedList');
    const tasks = Array.from(taskList.children).map(task => ({
        text: task.querySelector('.task-text').textContent,
        completed: task.classList.contains('completed')
    }));
    const finishedTasks = Array.from(finishedList.children).map(task => ({
        text: task.querySelector('.task-text').textContent,
        completed: true
    }));

    localStorage.setItem('tasks', JSON.stringify(tasks.concat(finishedTasks)));
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task.');
        return;
    }

    const taskList = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
        <span class="task-text">${taskText}</span>
        <div class="task-actions">
            <button class="taskbutton edit" onclick="editTask(this)" id="editButton"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="taskbutton" onclick="deleteTask(this)"><i class="fas fa-trash"></i></button>
            <button class="taskbutton" onclick="toggleComplete(this)"><i class="far fa-circle"></i></button>
        </div>
    `;
    taskList.appendChild(taskItem);

    saveTasksToLocalStorage();

    taskInput.value = '';

}

function editTask(buttonElement) {
  const taskItem = buttonElement.closest('li');
  const taskTextElement = taskItem.querySelector('.task-text');
  const isEditing = taskTextElement.getAttribute('contenteditable') === 'true';

  if (!isEditing) {
    taskTextElement.contentEditable = true;
    buttonElement.innerHTML = '<i class="fas fa-save"></i>';

    const range = document.createRange();
    range.selectNodeContents(taskTextElement);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    taskTextElement.focus();
  } else {
    taskTextElement.contentEditable = false;
    buttonElement.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  }

  saveTasksToLocalStorage();
}

document.getElementById("taskInput").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
      addTask()
  }
});

const completedSound = new Audio('sfx/completed.mp3');
const deletedSound = new Audio('sfx/deleted.mp3');
const alarmSound = new Audio('sfx/alarm.mp3');  

function playSound(sound) {
    sound.currentTime = 0;
    sound.volume = 0.3;
    sound.play();
}

function deleteTask(button) {
    const taskItem = button.parentElement.parentElement;
    const taskList = document.getElementById('taskList');
    const finishedList = document.getElementById('finishedList');

    if (taskItem.parentElement === taskList) {
        taskList.removeChild(taskItem);
    } else if (taskItem.parentElement === finishedList) {
        finishedList.removeChild(taskItem);
    }

    playSound(deletedSound);

    saveTasksToLocalStorage();
}

function toggleComplete(button) {
    const taskItem = button.parentElement.parentElement;
    const taskText = taskItem.querySelector('.task-text');
    const isCompleted = taskItem.classList.contains('completed');

    if (isCompleted) {
        taskItem.classList.remove('completed');
        taskItem.style.borderColor = '#ccc';
        button.innerHTML = '<i class="far fa-circle"></i>';
        document.getElementById('taskList').appendChild(taskItem);
    } 
    
    else {
        taskItem.classList.add('completed');
        taskItem.style.borderColor = '#4CAF50';
        button.innerHTML = '<i class="far fa-check-circle"></i>';
        document.getElementById('finishedList').appendChild(taskItem);

        playSound(completedSound);

        completeConfetti();
    }

    saveTasksToLocalStorage();
}

window.addEventListener('load', () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');
    const finishedList = document.getElementById('finishedList');

    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="taskbutton edit" onclick="editTask(this)" id="editButton"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="taskbutton" onclick="deleteTask(this)"><i class="fas fa-trash"></i></button>
                <button class="taskbutton" onclick="toggleComplete(this)">${task.completed ? '<i class="far fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}</button>
            </div>
        `;
        if (task.completed) {
            taskItem.classList.add('completed');
            taskItem.style.borderColor = '#4CAF50';
            taskItem.querySelector('.task-text').style.textDecoration = 'line-through';
            finishedList.appendChild(taskItem);
        } else {
            taskList.appendChild(taskItem);
        }
    });
});

const drawer = document.getElementById('drawer');
const handle = document.getElementById('handle');
const arrowIcon = document.getElementById('arrow-icon');

function toggleDrawer() {
    drawer.classList.toggle('open');
    arrowIcon.style.transform = arrowIcon.style.transform === 'rotate(180deg)' ? '' : 'rotate(180deg)';
}

let timer;
let isRunning = false;
let isBreak = false;
let minutes = 25;
let seconds = 0;

updateButtonAndTimer();

function toggleTimer() {
    if (!isRunning) {
        isBreak = !isBreak;
        if (isBreak) {
            document.getElementById('minutes').textContent = '5';
            document.querySelector('.pomodoro-button').textContent = 'Pomodoro';
            minutes = 5;
            seconds = 0;
        } else {
            document.getElementById('minutes').textContent = '25';
            document.querySelector('.pomodoro-button').textContent = 'Break';
            minutes = 25;
            seconds = 0;
        }

        updateButtonAndTimer();
    }
}

function updateButtonAndTimer() {
  const pomodoroButton = document.querySelector('.pomodoro-button');
  if (isBreak) {
      pomodoroButton.textContent = 'Pomodoro';
      document.getElementById('minutes').textContent = '5';
      document.getElementById('seconds').textContent = '00';
  } else {
      pomodoroButton.textContent = 'Break';
      document.getElementById('minutes').textContent = '25';
      document.getElementById('seconds').textContent = '00';
  }
}


function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(updateTimer, 1000);
    }
}

function stopTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
    }
}

function resetTimer() {
    stopTimer();
    minutes = 25;
    seconds = 0;
    updateDisplay();
}

function updateTimer() {
    if (seconds > 0) {
        seconds--;
    } else if (minutes > 0) {
        minutes--;
        seconds = 59;
    } else {
        stopTimer();
        playSound(alarmSound)
    }

    updateDisplay();
}

function updateDisplay() {
    const minutesDisplay = String(minutes).padStart(2, '0');
    const secondsDisplay = String(seconds).padStart(2, '0');
    document.getElementById('minutes').textContent = minutesDisplay;
    document.getElementById('seconds').textContent = secondsDisplay;
}

function setBreakTimer() {
  stopTimer();
  minutes = 5;
  seconds = 0;
  updateDisplay();
}

function setPomodoroTimer() {
  stopTimer();
  minutes = 25;
  seconds = 0;
  updateDisplay();
}



function completeConfetti() {
    var count = 200;
var defaults = {
  origin: { y: 1, x: 0 }
};

function fire(particleRatio, opts) {
  confetti(Object.assign({}, defaults, opts, {
    particleCount: Math.floor(count * particleRatio)
  }));
}

fire(0.25, {
  spread: 40,
  startVelocity: 55,
});
fire(0.2, {
  spread: 60,
});
fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8
});
fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2
});
fire(0.1, {
  spread: 120,
  startVelocity: 45,
});

var count = 200;
var defaults = {
  origin: { y: 1, x: 1 }
};

function fire(particleRatio, opts) {
  confetti(Object.assign({}, defaults, opts, {
    particleCount: Math.floor(count * particleRatio)
  }));
}

fire(0.25, {
  spread: 40,
  startVelocity: 55,
});
fire(0.2, {
  spread: 60,
});
fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8
});
fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2
});
fire(0.1, {
  spread: 120,
  startVelocity: 45,
});

}




