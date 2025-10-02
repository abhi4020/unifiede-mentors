const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const clearBtn = document.getElementById("clear");
const equalsBtn = document.getElementById("equals");
const backspaceBtn = document.getElementById("backspace");

let currentInput = "";

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.getAttribute("data-value");
    if (value) {
      // Insert at cursor position instead of appending
      const startPos = display.selectionStart;
      const endPos = display.selectionEnd;
      const textBefore = display.value.substring(0, startPos);
      const textAfter = display.value.substring(endPos);
      display.value = textBefore + value + textAfter;
      display.setSelectionRange(
        startPos + value.length,
        startPos + value.length
      );
      currentInput = display.value;
    }
  });
});

// Handle input changes properly
display.addEventListener("input", () => {
  currentInput = display.value;
});

// Handle backspace button properly
backspaceBtn.addEventListener("click", () => {
  const startPos = display.selectionStart;
  const endPos = display.selectionEnd;

  if (startPos === endPos && startPos > 0) {
    // Delete character before cursor
    const textBefore = display.value.substring(0, startPos - 1);
    const textAfter = display.value.substring(startPos);
    display.value = textBefore + textAfter;
    display.setSelectionRange(startPos - 1, startPos - 1);
  } else {
    // Delete selected text
    const textBefore = display.value.substring(0, startPos);
    const textAfter = display.value.substring(endPos);
    display.value = textBefore + textAfter;
    display.setSelectionRange(startPos, startPos);
  }
  currentInput = display.value;
});

clearBtn.addEventListener("click", () => {
  currentInput = "";
  display.value = "";
});

equalsBtn.addEventListener("click", () => {
  try {
    if (currentInput.trim() === "") return;
    let result = eval(currentInput);

    // Handle division by zero
    if (!isFinite(result)) {
      throw new Error("Cannot divide by zero");
    }

    display.value = result;
    currentInput = result.toString();
  } catch (error) {
    display.value = "Error";
    currentInput = "";
  }
});

// Handle keyboard input
document.addEventListener("keydown", (event) => {
  if (!isNaN(event.key) || "+-*/.".includes(event.key)) {
    const startPos = display.selectionStart;
    const endPos = display.selectionEnd;
    const textBefore = display.value.substring(0, startPos);
    const textAfter = display.value.substring(endPos);
    const newValue = textBefore + event.key + textAfter;
    display.value = newValue;
    display.setSelectionRange(startPos + 1, startPos + 1);
    currentInput = display.value;
  } else if (event.key === "Enter") {
    equalsBtn.click();
  } else if (event.key === "Backspace") {
    const startPos = display.selectionStart;
    const endPos = display.selectionEnd;

    if (startPos === endPos && startPos > 0) {
      const textBefore = display.value.substring(0, startPos - 1);
      const textAfter = display.value.substring(startPos);
      display.value = textBefore + textAfter;
      display.setSelectionRange(startPos - 1, startPos - 1);
    } else {
      const textBefore = display.value.substring(0, startPos);
      const textAfter = display.value.substring(endPos);
      display.value = textBefore + textAfter;
      display.setSelectionRange(startPos, startPos);
    }
    currentInput = display.value;
  } else if (event.key.toLowerCase() === "c") {
    clearBtn.click();
  }
});
