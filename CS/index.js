
const button = document.querySelector('button1');
button.addEventListener("click",dosomthing);

function dosomthing(){
    alert("are u ready to get into tg blocks");
}

setTimeout(() => {
    let important = document.querySelectorAll('.button1, .button2');
    for (let i = 0; i < important.length; i++) {
        important[i].style.color = "blue"; 
    }
}, 3000);
setTimeout(()=> {
    let important=document.querySelectorAll('.tg-blocks');
    for (let i = 0; i < important.length; i++) {
            important[i].style.color = "blue"; 
        }
  },3000)
  document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector(".lightmode");

    button.addEventListener("click", function () {
        if (document.body.style.backgroundColor === "black") {
            document.body.style.backgroundColor = "white";
            document.body.style.color="black"
            document.body.style.color = "black"; 
            button.textContent = "🌙 Dark Mode"; 
        } else {
            document.body.style.backgroundColor = "black";
            document.body.style.color = "white"; 
            button.textContent = "🌞 Light Mode";
        }
    });
});
    

// Theme Toggle
document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.querySelector(".theme-toggle");
    
    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        
        if (document.body.classList.contains("dark-mode")) {
            themeToggle.textContent = "🌞 Light Mode";
        } else {
            themeToggle.textContent = "🌙 Dark Mode";
        }
    });
    
    // Blockly-like Drag and Drop
    const blocks = document.querySelectorAll(".blocky");
    const dropZone = document.querySelector(".drop-zone");
    const codeOutput = document.querySelector(".code-output");
    
    let blockId = 0;
    
    blocks.forEach(block => {
        block.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", block.className);
        });
    });
    
    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    
    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        const blockClass = event.dataTransfer.getData("text/plain");
        const newBlock = document.createElement("div");
        
        // Clone a block from the toolbox
        const originalBlock = document.querySelector("." + blockClass.split(" ").join("."));
        newBlock.className = blockClass;
        newBlock.innerHTML = originalBlock.innerHTML;
        newBlock.id = "block-" + blockId++;
        
        // Position the block
        const rect = dropZone.getBoundingClientRect();
        newBlock.style.position = "absolute";
        newBlock.style.left = (event.clientX - rect.left - 50) + "px";
        newBlock.style.top = (event.clientY - rect.top - 20) + "px";
        
        // Make it draggable within the workspace
        newBlock.draggable = true;
        newBlock.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", newBlock.id);
        });
        
        // Add input event listeners
        const input = newBlock.querySelector(".block-input");
        if (input) {
            input.addEventListener("input", updateCode);
        }
        
        dropZone.appendChild(newBlock);
        updateCode();
    });
    
    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    
    dropZone.addEventListener("drop", (event) => {
        if (event.target === dropZone) {
            const blockId = event.dataTransfer.getData("text/plain");
            if (blockId.startsWith("block-")) {
                const block = document.getElementById(blockId);
                const rect = dropZone.getBoundingClientRect();
                block.style.left = (event.clientX - rect.left - 50) + "px";
                block.style.top = (event.clientY - rect.top - 20) + "px";
            }
        }
    });
    
    function updateCode() {
        let code = "";
        const blocks = dropZone.querySelectorAll(".blocky");
        
        blocks.forEach(block => {
            const input = block.querySelector(".block-input");
            const value = input ? input.value || input.placeholder : "";
            
            if (block.classList.contains("blocky-loop")) {
                code += `for (let i = 0; i < ${value}; i++) {\n  // Loop body\n}\n\n`;
            } else if (block.classList.contains("blocky-condition")) {
                code += `if (${value}) {\n  // Condition body\n}\n\n`;
            } else if (block.classList.contains("blocky-action")) {
                code += `${value}();\n\n`;
            } else if (block.classList.contains("blocky-variable")) {
                code += `let ${value} = 0;\n\n`;
            }
        });
        
        codeOutput.textContent = code || "// Your code will appear here";
    }
});
