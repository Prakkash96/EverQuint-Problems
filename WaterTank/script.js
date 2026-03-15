function trapWater(height) {
    let n = height.length
    let leftMax = new Array(n)
    let rightMax = new Array(n)
    leftMax[0] = height[0]
    for (let i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1], height[i])
    }
    rightMax[n - 1] = height[n - 1]
    for (let i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1], height[i])
    }
    let water = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
        water[i] = Math.min(leftMax[i], rightMax[i]) - height[i]
        if (water[i] < 0) water[i] = 0
    }
    return water
}

function createGrid(containerId, height, water) {
    const container = document.getElementById(containerId)
    container.innerHTML = ""
    const maxHeight = Math.max(...height)
    for (let level = maxHeight; level >= 1; level--) {
        const row = document.createElement("div")
        row.className = "row"
        for (let i = 0; i < height.length; i++) {
            const cell = document.createElement("div")
            cell.className = "cell"
            if (height[i] >= level) {
                cell.classList.add("block")
            }
            else if (water && (height[i] + water[i]) >= level) {
                cell.classList.add("water")
            }
            row.appendChild(cell)
        }
        container.appendChild(row)
    }
}

function solve() {
    const input = document.getElementById("arrayInput").value
    const height = input.split(",").map(Number)
    const water = trapWater(height)
    let total = water.reduce((a, b) => a + b, 0)
    document.getElementById("result").innerText = "Stored Water: " + total + " Units"
    createGrid("inputGrid", height, null)
    createGrid("outputGrid", height, water)
}