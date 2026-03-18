const BUILDINGS = [
    { name: "Pub", key: "P", time: 4, earn: 1000 },
    { name: "Theatre", key: "T", time: 5, earn: 1500 },
    { name: "Commercial Park", key: "C", time: 10, earn: 2000 }
];

function maxProfit(n, dpArray) {
    if (n < 0) return 0;
    if(dpArray[n]) return dpArray[n];
    let maxi = 0;
    for (let b of BUILDINGS)
        maxi = Math.max(maxi, (b.earn * (n - b.time) + maxProfit(n - b.time, dpArray)));
    return dpArray[n] = maxi;
}

function maxProfitPlan(n) {
    const result = [];
    if (n < 4) return [{ T: 0, P: 0, C: 0 }];
    if ((n % 5) == 4) {
        if (n > 5) result.push({ T: Math.floor(n / 5) - 1, P: 2, C: 0 });
        result.push({ T: Math.floor(n / 5), P: 1, C: 0 });
    }
    if ((n % 5) == 2) result.push({ T: Math.floor(n / 5) - 1, P: 1, C: 0 });
    result.push({ T: Math.floor((n - 2) / 5), P: ((n % 5) == 0 || (n % 5) == 1) ? 1 : 0, C: 0 });
    return result;
}

function solve(n) {
    console.log("\nNEW TEST CASE : \n\nINPUT : \nTime Unit = " + n + "\n\nOUTPUT : ");
    const dpArray = [];
    const result = maxProfitPlan(n);
    const maxi = maxProfit(n, dpArray);
    console.log("Earnings : " + maxi + "\nAll Possible Plans that earns maximum profit : ");
    for (const plan of result) {
        console.log(`{ T = ${plan.T} P = ${plan.P} C = ${plan.C} }`);
    };
    console.log("\n\n");
}

function testCases() {
    // TEST CASE 1 :-
    solve(7);
    // TEST CASE 2 :-
    solve(8);
    // TEST CASE 3 :-
    solve(13);
    // TEST CASE 4 :-
    solve(49);
}

function main() {
    testCases();
}

main();