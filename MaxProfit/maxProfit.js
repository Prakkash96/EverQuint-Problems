const BUILDINGS = [
    { name: "Pub", key: "P", time: 4, earn: 1000 },
    { name: "Theatre", key: "T", time: 5, earn: 1500 },
    { name: "Commercial Park", key: "C", time: 10, earn: 2000 }
];

function maxProfitPlans(n, sum, res, currObj) {
    if (sum > res.maxVal) {
        res.maxVal = sum;
        res.maxArr = new Set();
        res.maxArr.add({ T: currObj.T, P: currObj.P, C: currObj.C });
    } else if (sum === res.maxVal) {
        res.maxArr.add({ T: currObj.T, P: currObj.P, C: currObj.C });
    }
    if (n == 0) return sum;
    let maxi = 0;
    for (let b of BUILDINGS) {
        const timeLeft = n - b.time;
        const currEarning = sum + (b.earn * timeLeft);
        if (timeLeft >= 0) {
            currObj[b.key]++;
            maxi = Math.max(maxi, maxProfitPlans(timeLeft, currEarning, res, currObj));
            currObj[b.key]--;
        }
    }
    return Math.max(sum, maxi);
}

function solve(n) {
    console.log("\nNEW TEST CASE : \n\nINPUT : \nTime Unit = " + n + "\n\nOUTPUT : ");
    const resLog = { maxVal: 0, maxArr: new Set() };
    const result = maxProfitPlans(n, 0, resLog, { T: 0, P: 0, C: 0 });
    console.log("Earnings : " + result + "\nAll Possible Plans that earns maximum profit : ");
    resLog.maxArr.forEach((plan) => {
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
    // TEST CASE 4 :-
    solve(49);
}

function main() {
    testCases();
}

main();