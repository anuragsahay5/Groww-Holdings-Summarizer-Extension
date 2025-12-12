const GLOBAL_STATE = {
    tableVisible: false,
    main_div_frame: null,
    view_details_button: null,
    main_table_frame: null,
    close_button: null
}

const showTableFrame = () => {
    GLOBAL_STATE.tableVisible = true
    GLOBAL_STATE.view_details_button.textContent = "Close Details"
    GLOBAL_STATE.main_table_frame.style.display = "block"
    GLOBAL_STATE.main_table_frame.focus = true
}

const hideTableFrame = () => {
    GLOBAL_STATE.tableVisible = false
    GLOBAL_STATE.main_table_frame.style.display = "none"
    GLOBAL_STATE.view_details_button.textContent = "Show Details"
}

const handleGlobalStateChange = () => {
    if (GLOBAL_STATE.tableVisible) showTableFrame()
    else hideTableFrame();
}

const getRowHTML = ({ company, marketPrice, returns, charges, netPL, buyPrice, qty }) => {
    return `
    <tr>
        <td style="text-align: left;" title=${company}>${company}<div class="bodySmall" >${buyPrice} <b>:</b> ${qty} shares</div></td>
        <td style="text-align: right;">${marketPrice}</td>
        <td style="text-align: right;" class="${returns[0] == '-' ? "contentNegative" : "contentPositive"}">${returns}</td>
        <td style="text-align: right;">₹${charges}</td>
        <td style="text-align: right;" class="${netPL >= 0 ? "contentPositive" : "contentNegative"}">${netPL.toLocaleString('en-IN', { style: "currency", currency: "INR" })}</td>
    </tr>
    `
}

const getValuesFromTableRow = (row_element) => {
    return {
        "company": row_element.children[0].children[0].textContent,
        "qty": row_element.children[0].children[1].children[0].textContent.slice(0, -7),
        "buyPrice": row_element.children[0].children[1].children[2].textContent.slice(5),
        "marketPrice": row_element.children[2].childNodes[0].textContent,
        "returns": row_element.children[3].childNodes[0].textContent
    }
}

const getTotalCharges = ({ qty, buyPrice, marketPrice }) => {
    const TOTAl_CHARGES = CALCULATE_TOTAL_CHARGES(buyPrice, marketPrice, qty, 1)
    let total_charges = 0.00;
    for (x in TOTAl_CHARGES) {
        for (y in TOTAl_CHARGES[x]) {
            total_charges += parseFloat(TOTAl_CHARGES[x][y]);
        }
    }
    return total_charges
}

const updateTable = () => {
    const trs = document.querySelectorAll(".holdingTable_noBorder__BDRki")[0].children[1].children
    const holdings_lists = Array.from(trs).map((tr) => {
        return getValuesFromTableRow(tr)
    })

    const data_lists = holdings_lists.map((holdings) => {
        const total_charges = parseFloat(getTotalCharges({
            qty: holdings.qty,
            buyPrice: holdings.buyPrice.slice(1),
            marketPrice: holdings.marketPrice.slice(1)
        }).toFixed(2))

        return {
            ...holdings,
            totalCharges: total_charges,
            netPL: parseFloat(holdings.returns.replace(/[₹,]/g, '')) - total_charges
        }
    })

    GLOBAL_STATE.main_table_frame.children[0].children[1].children[1].innerHTML = ""

    data_lists.forEach((data_list) => {
        GLOBAL_STATE.main_table_frame.children[0].children[1].children[1].innerHTML += getRowHTML({
            ...data_list,
            charges: data_list.totalCharges

        })
    })

}

const addWidget = () => {
    try {
        GLOBAL_STATE.main_div_frame = document.createElement("div")
        GLOBAL_STATE.view_details_button = document.createElement("button")
        GLOBAL_STATE.main_table_frame = document.createElement("div")

        GLOBAL_STATE.main_div_frame.setAttribute("id", "hUNjLePtTQ")
        GLOBAL_STATE.main_table_frame.setAttribute("id", "LycwXRwoDa")
        GLOBAL_STATE.view_details_button.setAttribute("id", "APggbvzWvH")
        GLOBAL_STATE.view_details_button.textContent = "View Details"

        GLOBAL_STATE.main_div_frame.appendChild(GLOBAL_STATE.view_details_button)
        GLOBAL_STATE.main_div_frame.appendChild(GLOBAL_STATE.main_table_frame)
        document.body.prepend(GLOBAL_STATE.main_div_frame)

        const custom_style = document.createElement("style");
        custom_style.textContent = "";
        document.head.appendChild(custom_style);

        GLOBAL_STATE.main_table_frame.innerHTML = `
        <div id="BzFZasRDLg">
                <button id="YwaePCFNGQ" >close</button>
                <table cellspacing="0">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Company</th>
                            <th style="text-align: right;">Market Price</th>
                            <th style="text-align: right;">Returns</th>
                            <th style="text-align: right;">Charges</th>
                            <th style="text-align: right;">Net P&L</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `

        GLOBAL_STATE.view_details_button.addEventListener("click", () => {
            GLOBAL_STATE.tableVisible = !GLOBAL_STATE.tableVisible
            handleGlobalStateChange()
        })

        GLOBAL_STATE.close_button = document.getElementById("YwaePCFNGQ")

        GLOBAL_STATE.close_button.addEventListener("click", () => {
            GLOBAL_STATE.tableVisible = false
            handleGlobalStateChange()
        })

    } catch (error) {
        console.log("Extension error :", error.message)
    }
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
        updateTable()
    })
})

window.addEventListener("load", () => {
    setTimeout(() => {
        addWidget()
        const tds = Array.from(document.querySelectorAll(".holdingTable_noBorder__BDRki")[0].children[1].children).map((val) => {
            return val.children[2].childNodes[0]
        })
        updateTable()

        tds.forEach(td => {
            observer.observe(td, {
                characterData: true,
                subtree: true
            })
        })
    }, 2000)
})


