// loot table that will be used
const Loot = [];

let hasSplit = false;

// event listeners
document.getElementById("loot-add-button").addEventListener("click", addLoot);
document.getElementById("loot-split-button").addEventListener("click", splitLoot);

// renders error messages on the page
// l = element to apply error to, e = error message
// when using "[CLEAR]" for e, removes error message instead
function errorSend(l, e) {
    const Container = document.getElementById(l);
    Container.innerHTML = ""; // clean container out
    if (e != "[CLEAR]") {
        const Error = document.createElement("p");
        Error.textContent = e;
        console.log("[ERROR]: " + e);
        Container.appendChild(Error);
    }
}

// helper for renderSplit()
function getTotal() {
    let total = 0;

    for (let i = 0; i < Loot.length; i++) {
        total += Number(Loot[i].value);
    }

    return total;
}

// renders the loot list
function renderLoot() {
    const Container = document.getElementById("loot-list");
    const TotalHolder = document.getElementById("total-holder-list");
    let total = 0;
    Container.innerHTML = ""; // clean container out
    for (let i = 0; i < Loot.length; i++) {
        let line = document.createElement("p");
        line.textContent = "Loot: " + Loot[i].name + " ($" + Number(Loot[i].value).toFixed(2) + ")";
        Container.appendChild(line);
        total++;
    }
    TotalHolder.textContent = "Total Loot: " + total;
}

// renders party list in the split section
function renderSplit(party) {
    const Container = document.getElementById("split-log");
    const TotalHolder = document.getElementById("total-holder-split");
    const lootPerHolder = document.getElementById("loot-per-member-holder");
    let total = 0;
    let totalValue = 0; // for loot per holder, not the member total
    Container.innerHTML = ""; //clean container out
    
    for (let i = 0; i < party.length; i++) {
        let hr = document.createElement("hr");
        let member = document.createElement("p")
        member.textContent = "Member " + party[i].memberNumber;
        Container.appendChild(member);

        for (let j = 0; j < party[i].lootGiven.length; j++) {
            let loot = document.createElement("p");
            loot.textContent = "Loot: " + party[i].lootGiven[j];
            Container.appendChild(loot);
            total++;
        }

        let memberTotal = document.createElement("p");
        memberTotal.textContent = "Total value: $" + party[i].totalValueGiven.toFixed(2);
        Container.appendChild(memberTotal);
        
        Container.appendChild(hr);
    }

    TotalHolder.textContent = "Total Loot: " + total;
    // this isn't accurate by any means but 
    lootPerHolder.textContent = `Loot Per Party Member: $${(getTotal() / party.length).toFixed(2)} (estimated)`;
}

// adds loot to the loot list, then calls renderLoot()
function addLoot() {
    // input info (existing elements)
    let lootName = document.getElementById("lootName").value;
    let lootValue = document.getElementById("lootValue").value;
    
    // validation
    if (lootName == "" || lootValue == "") {
        errorSend("add-error", "Loot Name or Value is empty!");
        return;
    } else if (isNaN(lootValue) || lootValue <= 0) {
        errorSend("add-error", "Loot Value must be a number that is above 0.");
        return;
    }

    errorSend("add-error", "[CLEAR]")

    Loot.push({name: lootName, value: Number(lootValue).toFixed(2)});

    renderLoot();
    
    // allows loot split to update if it's already been split once
    if (hasSplit) {
        splitLoot();
    }
}

// calculates and splits loot between party
function splitLoot() {
    let partySize = document.getElementById("party-num").value;
    const Party = [];
    for (let i = 1; i <= partySize; i++) {
        Party.push({
            memberNumber: i,
            lootGiven: [],
            totalValueGiven: 0
        })
    }
    console.log(partySize);
    
    // validation goes in order of party size -> loot count
    if (partySize == "" || isNaN(partySize) || partySize <= 0) {
        errorSend("split-error", "Party count is not a number, is empty, or is less than 1!");
        return;
    } else if (Loot.length == 0) {
        errorSend("split-error", "You must add at least 1 piece of loot!");
        return;
    }

    errorSend("split-error", "[CLEAR]")

    hasSplit = true; // so that it can auto update...

    // ok so this is a bit tricky, but basically i decided to sort the loot, then distribute items to the
    // member with the lowest total value, so if someone already has a high value they won't get items until
    // the others are around their value.
    let sortedLoot = [...Loot].sort((a, b) => b.value - a.value);

    for (let i = 0; i < sortedLoot.length; i++) {
        let lowestMember = Party[0];
        // go through members until we find the next lowest
        for (let j = 1; j < Party.length; j++) {
            if (Party[j].totalValueGiven < lowestMember.totalValueGiven) {
                lowestMember = Party[j];
            }
        }

        lowestMember.lootGiven.push(sortedLoot[i].name + " ($" + Number(sortedLoot[i].value).toFixed(2) + ")");
        lowestMember.totalValueGiven += Number(sortedLoot[i].value);
    }

    renderSplit(Party);
}

