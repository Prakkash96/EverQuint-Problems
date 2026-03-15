const BUILDINGS = [
    { name: "Theatre", key: "T", time: 5, earn: 1500 },
    { name: "Pub", key: "P", time: 4, earn: 1000 },
    { name: "Commercial Park", key: "C", time: 10, earn: 2000 }
];

function dfs(state, n, currentTime, profit, plan) {
    let moved = false;
    for (let b of BUILDINGS) {
        let finish = currentTime + b.time;
        if (finish <= n) {
            moved = true;
            let earning = (n - finish) * b.earn;
            plan[b.key]++;
            dfs(state, n, finish, profit + earning, plan);
            plan[b.key]--;
        }
    }
    if (!moved) {
        if (profit > state.maxProfit) {
            state.maxProfit = profit;
            state.solutions = [{ ...plan }];
        }
        else if (profit === state.maxProfit) {
            state.solutions.push({ ...plan });
        }
    }
}

function maxProfitPlans(n) {
    let state = { maxProfit: 0, solutions: [] };
    dfs(state, n, 0, 0, { T: 0, P: 0, C: 0 });
    return state;
}

function solve(n) {
    console.log("\nNEW TEST CASE : \n\nINPUT : \nTime Unit = " + n + "\n\nOUTPUT : ");
    const result = maxProfitPlans(n);
    console.log("Earnings : " + result.maxProfit + "\nAll Possible Plans that earns maximum profit : ");
    result.solutions.forEach((plan, index) => {
        console.log(`{ T = ${plan.T} P = ${plan.P} C = ${plan.C} }`);
    });
    console.log("\n\n");
}

function testCases() {
    // TEST CASE 1 :-
    solve(7);
    // TEST CASE 2 :-
    solve(8);
    // TEST CASE 3 :-
    solve(13);
}

function main() {
    testCases();
}

main();