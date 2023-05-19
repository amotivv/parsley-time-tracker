let startTime = null;
let stopTime = null;
let taskName = null;

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['startTime', 'taskName'], function (result) {
        const startButton = document.getElementById('start');
        const stopButton = document.getElementById('stop');
        const currentTaskDiv = document.getElementById('currentTask');
        const pulseDiv = document.getElementById('pulse');

        if (result.startTime && result.taskName) {
            startButton.classList.add('hidden');
            stopButton.classList.remove('hidden');
            currentTaskDiv.textContent = "Current Task: " + result.taskName;
            pulseDiv?.classList.remove('pulse-inactive');
            pulseDiv?.classList.add('pulse-active');
            disableButtons();
            stopButton.disabled = false;

            chrome.browserAction.setIcon({ path: "extension-active.png" });
        } else {
            startButton.classList.remove('hidden');
            stopButton.classList.add('hidden');
            currentTaskDiv.textContent = "";
            pulseDiv?.classList.remove('pulse-active');
            enableButtons();
        }
    });

    document.getElementById('start').addEventListener('click', function () {
        startTime = new Date().getTime();
        taskName = document.getElementById('task').value;
        document.getElementById('task').value = '';

        const startButton = document.getElementById('start');
        const stopButton = document.getElementById('stop');
        const currentTaskDiv = document.getElementById('currentTask');
        const pulseDiv = document.getElementById('pulse');

        startButton.classList.add('hidden');
        stopButton.classList.remove('hidden');
        currentTaskDiv.textContent = "Current Task: " + taskName;
        pulseDiv?.classList.remove('pulse-inactive');
        pulseDiv?.classList.add('pulse-active');
        disableButtons();
        stopButton.disabled = false;
        chrome.storage.local.set({ startTime: startTime, taskName: taskName });

        chrome.browserAction.setIcon({ path: "extension-active.png" });
    });

    document.getElementById('stop').addEventListener('click', function () {
        stopTime = new Date().getTime();
        const startButton = document.getElementById('start');
        const stopButton = document.getElementById('stop');
        const pulseDiv = document.getElementById('pulse');
        const currentTaskDiv = document.getElementById('currentTask');

        startButton.classList.remove('hidden');
        stopButton.classList.add('hidden');
        currentTaskDiv.textContent = "";
        pulseDiv?.classList.remove('pulse-active');
        pulseDiv?.classList.add('pulse-inactive');

        chrome.storage.local.get(['startTime', 'taskName'], function (result) {
            let startTime = result.startTime;
            let taskName = result.taskName;

            let time = Math.ceil((stopTime - startTime) / 60000); // Minutes rounded up
            let date = new Date(stopTime).toLocaleDateString();
            let startTimeFormatted = new Date(startTime).toLocaleTimeString();
            let stopTimeFormatted = new Date(stopTime).toLocaleTimeString();

            chrome.browserAction.setIcon({ path: "icon.png" });

            chrome.storage.local.get('tasks', function (result) {
                let tasks = result.tasks || [];
                tasks.push({
                    task: taskName,
                    time: time,
                    date: date,
                    startTime: startTimeFormatted,
                    endTime: stopTimeFormatted
                });
                chrome.storage.local.set({ tasks: tasks }, function () {
                    displayTasks(tasks);
                    enableButtons();
                });
            });
        });

        chrome.storage.local.remove(['startTime', 'taskName']);
    });

    document.getElementById('download').addEventListener('click', function () {
        chrome.storage.local.get('tasks', function (result) {
            let tasks = result.tasks || [];
            let csvContent = "data:text/csv;charset=utf-8,"
                + "Task,Time (Minutes),Date,Start Time,End Time\n"
                + tasks.map(e => e.task + "," + e.time + "," + e.date + "," + e.startTime + "," + (e.endTime || 'Unknown')).join("\n");
            let encodedUri = encodeURI(csvContent);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "tasks.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    document.getElementById('markdown').addEventListener('click', function () {
        chrome.storage.local.get('tasks', function (result) {
            let tasks = result.tasks || [];
            let markdownContent = "## Tasks\n\n"
                + tasks.map(e => "- **Task:** " + e.task + "\n  - **Time:** " + e.time + " minutes\n  - **Date:** " + e.date + "\n  - **Start Time:** " + e.startTime + "\n  - **End Time:** " + (e.endTime || 'Unknown')).join("\n");
            let markdownWindow = window.open("");
            markdownWindow.document.write("<pre>" + markdownContent + "</pre>");
        });
    });
    

    function disableButtons() {
        document.getElementById('download').disabled = true;
        document.getElementById('markdown').disabled = true;
    }

    function enableButtons() {
        document.getElementById('download').disabled = false;
        document.getElementById('markdown').disabled = false;
        document.getElementById('stop').disabled = false;
    }

    function displayTasks(tasks) {
        tasks = tasks || [];
        let tasksDiv = document.getElementById('tasks');
        tasksDiv.innerHTML = '';
        tasks.forEach((task, index) => {
            let taskElement = document.createElement('p');
            taskElement.innerHTML = `${task.task}: ${task.time} minutes on ${task.date} from ${task.startTime} to ${task.endTime} <button class="delete" data-index="${index}">Delete</button>`;
            tasksDiv.appendChild(taskElement);
        });
        let deleteButtons = document.getElementsByClassName('delete');
        for (let i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function () {
                let index = this.getAttribute('data-index');
                tasks.splice(index, 1);
                chrome.storage.local.set({ tasks: tasks }, function () {
                    displayTasks(tasks);
                });
            });
        }
    }

    chrome.storage.local.get('tasks', function (result) {
        let tasks = result.tasks || [];
        displayTasks(tasks);
    });
});
