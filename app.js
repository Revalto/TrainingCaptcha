const { stat } = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
const allNumbers = [..."0123456789"];

let state = {
    base: [],
    success: 0, // Привильные
    bad: 0, // Не правильные
    error: 0, // Ошибки
    errors_list: [], // Текущий список ошибок
    all_errors_list: [], // Общий список ошибок
    time_list: [], // Список всех результатов
};

const random = (base, len) => [...Array(len)]
    .map(i => base[Math.random() * base.length|0])
    .join('');

const startTraining = () => {
    const startTime = Date.now();
    const captcha = random(state.base, 5);

    const averageErrors = state["all_errors_list"] != 0
        ? state["all_errors_list"].reduce((a, b) => (a + b)) / state["all_errors_list"].length
        : 0

    const averageTime = state["time_list"] != 0
        ? state["time_list"].reduce((a, b) => (a + b)) / state["time_list"].length
        : 0

    console.clear();
    console.log(
        `Статистика:\n`,
        `- Всего решено: ${+state.success + +state.bad}\n`,
        `- Правильные: ${state.success}\n`,
        `- Не правильные: ${state.bad}\n`,
        `- Ошибок: ${state.error}\n`,
        `- Среднее количество ошибок: ${averageErrors.toFixed(2)}\n`,
        `- Среднее время: ${averageTime.toFixed(2)} ms.\n`,
        `\n`,
        `Ошибки: ${state.errors_list.join(' | ')}\n\n`,
    );

    rl.question(`Капча: ${captcha}\n`, (result) => {
        const resultChars = result.split('');

        let thisErrors = [];
        let thisErrorsCount = 0;
        captcha.split('').forEach((c, i) => {
            if(c != resultChars[i]) {
                thisErrorsCount += 1;
                thisErrors = [
                    ...thisErrors,
                    `${c} => ${resultChars[i]}`
                ];
            }
        });

        state[thisErrorsCount == 0 ? "success" : "bad"] += 1;
        state["error"] += thisErrorsCount;
        state["errors_list"] = thisErrors;
        state["all_errors_list"] = [
            ...state["all_errors_list"],
            thisErrorsCount
        ];
        state["time_list"] = [
            ...state["time_list"],
            Date.now() - startTime
        ];

        startTraining();
    })
};

const start = () => {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + `TrainingCaptcha v1.0 by Revalto` + String.fromCharCode(7)
    );

    console.log(
        `Добро пожаловать на тренеровочную площадку!\n`,
        `Выберите тип тренировки:\n`,
        `[1] Числа:\n`,
        `[2] Строки:\n`,
        `[3] Числа + Строки:\n`,
    );

    rl.question(`Ваш ответ: `, (number) => {
        if(!number || isNaN(number) || number < 1 || number > 3) {
            return console.log(`Не правильно указаны аргументы! Введите число от 1 до 3`);
        }

        switch(+number) {
            case 1: state.base = [...allNumbers]; break;
            case 2: state.base = [...allLowerAlpha]; break;
            case 3: state.base = [...allNumbers, ...allLowerAlpha]; break;
        }

        startTraining();
    });
}

start();