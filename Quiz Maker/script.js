document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const userSection = document.getElementById('user-section');
    const resultSection = document.getElementById('result-section');
    
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const saveQuizBtn = document.getElementById('save-quiz-btn');
    const quizSelect = document.getElementById('quiz-select');
    const userFile = document.getElementById('user-file');
    const allocateQuizBtn = document.getElementById('allocate-quiz-btn');
    const quizListContainer = document.getElementById('quiz-list-container');
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const resultContainer = document.getElementById('result-container');
    const backBtn = document.getElementById('back-btn');
    const loginForm = document.getElementById('login-form');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const createQuizForm = document.getElementById('create-quiz-form');

    let currentUser = null;
    let currentQuiz = null;

    const admins = {
        "admin": "admin123"
    };

    let users = JSON.parse(localStorage.getItem('users')) || {};
    let allocations = JSON.parse(localStorage.getItem('allocations')) || {};

    function saveUsersToLocalStorage() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function saveAllocationsToLocalStorage() {
        localStorage.setItem('allocations', JSON.stringify(allocations));
    }

    function loadUsersFromFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            json.forEach(row => {
                users[row.Username] = row.Password;
            });
            saveUsersToLocalStorage();
            alert('Users loaded successfully!');
        };
        reader.readAsArrayBuffer(file);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (admins[username] && admins[username] === password) {
            currentUser = username;
            loginSection.classList.add('hidden');
            adminSection.classList.remove('hidden');
            loadQuizzes();
        } else if (users[username] && users[username] === password) {
            currentUser = username;
            loginSection.classList.add('hidden');
            userSection.classList.remove('hidden');
            loadAllocatedQuizzes();
        } else {
            alert('Invalid username or password');
        }
    });

    createQuizBtn.addEventListener('click', () => {
        createQuizForm.classList.toggle('hidden');
    });

    addQuestionBtn.addEventListener('click', () => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.innerHTML = `
            <input type="text" placeholder="Question" class="question-text">
            <input type="text" placeholder="Option 1" class="question-option">
            <input type="text" placeholder="Option 2" class="question-option">
            <input type="text" placeholder="Option 3" class="question-option">
            <input type="text" placeholder="Option 4" class="question-option">
            <input type="text" placeholder="Correct Option" class="correct-option">
        `;
        questionsContainer.appendChild(questionItem);
    });

    saveQuizBtn.addEventListener('click', () => {
        const quiz = [];
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            const questionText = item.querySelector('.question-text').value;
            const options = item.querySelectorAll('.question-option');
            const correctOption = item.querySelector('.correct-option').value;
            const question = {
                questionText,
                options: Array.from(options).map(option => option.value),
                correctOption
            };
            quiz.push(question);
        });

        const quizTitle = prompt("Enter a title for the quiz:");
        if (quizTitle) {
            localStorage.setItem(quizTitle, JSON.stringify(quiz));
            alert('Quiz saved successfully!');
            populateQuizSelect();
        }
    });

    allocateQuizBtn.addEventListener('click', () => {
        const selectedQuiz = quizSelect.value;
        if (!selectedQuiz) {
            alert('Please select a quiz to allocate');
            return;
        }
        if (!userFile.files.length) {
            alert('Please upload a user file');
            return;
        }
        loadUsersFromFile(userFile.files[0]);
        allocations[selectedQuiz] = Object.keys(users);
        saveAllocationsToLocalStorage();
        alert('Quiz allocated successfully!');
    });

    submitQuizBtn.addEventListener('click', () => {
        const quiz = JSON.parse(localStorage.getItem(currentQuiz));
        let score = 0;
        const answers = [];
        quiz.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption && selectedOption.value === question.correctOption) {
                score++;
            }
            answers.push({
                question: question.questionText,
                correctOption: question.correctOption,
                selectedOption: selectedOption ? selectedOption.value : null
            });
        });

        displayResults(answers, score, quiz.length);
    });

    backBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        loadAllocatedQuizzes();
    });

    function loadQuizzes() {
        populateQuizSelect();
    }

    function populateQuizSelect() {
        quizSelect.innerHTML = '';
        Object.keys(localStorage).forEach(key => {
            if (key !== 'users' && key !== 'allocations') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                quizSelect.appendChild(option);
            }
        });
    }

    function loadAllocatedQuizzes() {
        quizListContainer.innerHTML = '';
        const allocatedQuizzes = Object.keys(allocations).filter(quiz => allocations[quiz].includes(currentUser));
        allocatedQuizzes.forEach(key => {
            const quizItem = document.createElement('div');
            quizItem.classList.add('quiz-item');
            quizItem.textContent = key;
            quizItem.addEventListener('click', () => {
                loadQuiz(key);
            });
            quizListContainer.appendChild(quizItem);
        });
    }

    function loadQuiz(quizTitle) {
        quizContainer.classList.remove('hidden');
        const quiz = JSON.parse(localStorage.getItem(quizTitle));
        currentQuiz = quizTitle;
        const form = document.getElementById('take-quiz-form');
        form.innerHTML = '';
        quiz.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `
                <p>${question.questionText}</p>
                ${question.options.map((option, i) => `
                    <label>
                        <input type="radio" name="question-${index}" value="${i + 1}">
                        ${option}
                    </label><br>
                `).join('')}
            `;
            form.appendChild(questionDiv);
        });
    }

    function displayResults(answers, score, totalQuestions) {
        resultSection.classList.remove('hidden');
        userSection.classList.add('hidden');
        resultContainer.innerHTML = '';
        answers.forEach(answer => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.innerHTML = `
                <p>Question: ${answer.question}</p>
                <p>Correct Option: ${answer.correctOption}</p>
                <p>Your Answer: ${answer.selectedOption}</p>
            `;
            resultContainer.appendChild(resultItem);
        });
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `<h2>Your Score: ${score} / ${totalQuestions}</h2>`;
        resultContainer.appendChild(scoreDiv);
    }

    // Initialize the quiz select options
    populateQuizSelect();
});
