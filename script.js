const QUESTIONS_URL =
    "https://example.com/questions.txt";


let questions = [];
let currentQuestion = 0;
let answers = [];


/* Elements */

const startScreen =
    document.getElementById("start-screen");

const examScreen =
    document.getElementById("exam-screen");

const confirmScreen =
    document.getElementById("confirm-screen");

const finishedScreen =
    document.getElementById("finished-screen");

const startButton =
    document.getElementById("start-button");

const previousButton =
    document.getElementById("previous-button");

const nextButton =
    document.getElementById("next-button");

const submitButton =
    document.getElementById("submit-button");

const confirmBack =
    document.getElementById("confirm-back");

const questionText =
    document.getElementById("question-text");

const choiceList =
    document.getElementById("choice-list");

const questionNumber =
    document.getElementById("question-number");

const sectionTitle =
    document.getElementById("section-title");

const progressText =
    document.getElementById("progress-text");

const progressBar =
    document.getElementById("progress-bar");

const answerStatus =
    document.getElementById("answer-status");

const confirmText =
    document.getElementById("confirm-text");


/* Screen control */

function showScreen(screen) {
    document.querySelectorAll(".screen")
        .forEach(element => {
            element.classList.remove("active");
        });

    screen.classList.add("active");
}


/* Load questions */

async function loadQuestions() {

    const response =
        await fetch(QUESTIONS_URL, {
            cache: "no-store"
        });

    if (!response.ok) {
        throw new Error(
            "Could not load questions."
        );
    }

    const text =
        await response.text();

    return parseQuestions(text);
}


/* TXT parser */

function parseQuestions(text) {

    const blocks =
        text
            .split(/\n\s*\n/)
            .map(block => block.trim())
            .filter(Boolean);

    let currentSection = "";

    const result = [];

    for (const block of blocks) {

        const lines =
            block
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean);

        if (!lines.length) {
            continue;
        }

        if (lines[0].startsWith("#")) {

            currentSection =
                lines[0]
                    .substring(1)
                    .trim();

            lines.shift();
        }

        if (lines.length < 2) {
            continue;
        }

        const question =
            lines[0];

        const choices =
            lines[1]
                .split(",")
                .map(choice => choice.trim())
                .filter(Boolean);

        result.push({
            section: currentSection,
            question,
            choices
        });
    }

    return result;
}


/* Start */

startButton.addEventListener(
    "click",
    async () => {

        startButton.disabled = true;

        try {

            questions =
                await loadQuestions();

            if (!questions.length) {
                throw new Error(
                    "No questions found."
                );
            }

            answers =
                new Array(questions.length)
                    .fill(null);

            currentQuestion = 0;

            showScreen(examScreen);

            renderQuestion();

        } catch (error) {

            console.error(error);

            alert(
                "Question data could not be loaded."
            );

        } finally {

            startButton.disabled = false;
        }
    }
);


/* Render question */

function renderQuestion() {

    const question =
        questions[currentQuestion];

    questionNumber.textContent =
        currentQuestion + 1;

    sectionTitle.textContent =
        question.section || "kuesto";

    questionText.textContent =
        question.question;

    choiceList.innerHTML = "";

    question.choices.forEach(
        (choice, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className = "choice";

            if (
                answers[currentQuestion] === index
            ) {
                button.classList.add("selected");
            }

            const marker =
                document.createElement("span");

            marker.className =
                "choice-marker";

            marker.textContent =
                String.fromCharCode(
                    65 + index
                );

            const text =
                document.createElement("span");

            text.className =
                "choice-text";

            text.textContent =
                choice;

            button.appendChild(marker);
            button.appendChild(text);

            button.addEventListener(
                "click",
                () => {

                    answers[currentQuestion] =
                        index;

                    renderQuestion();
                }
            );

            choiceList.appendChild(button);
        }
    );

    updateNavigation();
}


/* Navigation */

function updateNavigation() {

    previousButton.disabled =
        currentQuestion === 0;

    const lastQuestion =
        currentQuestion === questions.length - 1;

    nextButton.textContent =
        lastQuestion
            ? "skile"
            : "ir nekset";

    const answered =
        answers[currentQuestion] !== null;

    answerStatus.textContent =
        answered
            ? "svared"
            : "non-svared";

    const progress =
        (
            (currentQuestion + 1)
            / questions.length
        ) * 100;

    progressBar.style.width =
        `${progress}%`;

    progressText.textContent =
        `${currentQuestion + 1} / ${questions.length}`;
}


/* Previous */

previousButton.addEventListener(
    "click",
    () => {

        if (currentQuestion <= 0) {
            return;
        }

        currentQuestion--;

        renderQuestion();
    }
);


/* Next / submit */

nextButton.addEventListener(
    "click",
    () => {

        const lastQuestion =
            currentQuestion === questions.length - 1;

        if (lastQuestion) {
            openConfirmScreen();
            return;
        }

        currentQuestion++;

        renderQuestion();
    }
);


/* Confirmation */

function openConfirmScreen() {

    const unanswered =
        answers.filter(
            answer => answer === null
        ).length;

    if (unanswered === 0) {

        confirmText.textContent =
            "skile";

    } else {

        confirmText.textContent =
            `${unanswered} non-svared`;
    }

    showScreen(confirmScreen);
}


confirmBack.addEventListener(
    "click",
    () => {

        showScreen(examScreen);

        renderQuestion();
    }
);


/* Submit */

submitButton.addEventListener(
    "click",
    () => {

        showScreen(finishedScreen);

        document.getElementById(
            "score-display"
        ).textContent = "-";
    }
);