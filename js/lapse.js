const STORAGE_KEY = "lapse";
const emptyRow = () => ({ start: "", end: "" });

const rowsEl = document.querySelector("#rows");
const totalEl = document.querySelector("#total");
const decimalEl = document.querySelector("#decimal");

const load = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved) && saved.length > 0) {
            return saved.map(row => ({ start: row.start || "", end: row.end || "" }));
        }
    }
    catch (error) {
        // Storage unavailable: start blank
    }
    return [emptyRow()];
};

const save = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.rows));
    }
    catch (error) {
        // Ignore
    }
};

const state = { rows: load() };

// "HH:MM" -> minutes since 00:00 (null if empty)
const toMinutes = value => {
    if (!value) {
        return null;
    }
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
};

const formatDuration = minutes => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
};

const formatDecimal = minutes => {
    const value = (minutes / 60).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${value} h`;
};

// Rebuild the rows (only on add, remove or clear, so typing never loses focus)
const renderRows = () => {
    rowsEl.innerHTML = state.rows.map((row, index) => `
        <div class="w-full grid grid-cols-4 gap-2" data-index="${index}">
            <input class="rounded-lg p-2 border-1 border-gray-200 bg-white text-sm" type="time" aria-label="Start" data-field="start" value="${row.start}">
            <input class="rounded-lg p-2 border-1 border-gray-200 bg-white text-sm" type="time" aria-label="End" data-field="end" value="${row.end}">
            <div class="w-full flex items-center justify-center">
                <span class="text-sm font-bold" data-result>—</span>
            </div>
            <div class="w-full flex items-center justify-end">
                <button type="button" class="flex p-2 rounded-lg bg-white hover:bg-gray-100" aria-label="Remove interval" data-remove>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join("");
    update();
};

const update = () => {
    let total = 0;
    state.rows.forEach((row, index) => {
        const result = rowsEl.children[index].querySelector("[data-result]");
        const start = toMinutes(row.start);
        const end = toMinutes(row.end);
        result.className = "result muted";
        if (start === null || end === null) {
            result.textContent = "—";
        }
        else if (end < start) {
            result.className = "result error";
            result.textContent = "End < start";
        }
        else {
            total = total + (end - start);
            result.className = "result";
            result.textContent = formatDuration(end - start);
        }
    });
    totalEl.textContent = formatDuration(total);
    decimalEl.textContent = formatDecimal(total);
    save();
};

rowsEl.addEventListener("input", event => {
    const field = event.target.dataset.field;
    if (field) {
        const index = Number(event.target.closest("[data-index]").dataset.index);
        state.rows[index][field] = event.target.value;
        update();
    }
});

rowsEl.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (button) {
        const index = Number(button.closest("[data-index]").dataset.index);
        state.rows.splice(index, 1);
        if (state.rows.length === 0) {
            state.rows.push(emptyRow());
        }
        renderRows();
    }
});

document.querySelector("#add").addEventListener("click", () => {
    state.rows.push(emptyRow());
    renderRows();
    rowsEl.lastElementChild.querySelector("input").focus();
});

document.querySelector("#reset").addEventListener("click", () => {
    state.rows = [emptyRow()];
    renderRows();
});

renderRows();
