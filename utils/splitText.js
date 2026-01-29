// Simple SplitText alternative for character and word splitting
export class SplitText {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.type = options.type || 'chars';
        this.charsClass = options.charsClass || 'char';
        this.wordsClass = options.wordsClass || 'word';
        this.linesClass = options.linesClass || 'line';
        
        this.chars = [];
        this.words = [];
        this.lines = [];
        
        if (this.element) {
            this.split();
        }
    }
    
    static create(element, options) {
        return new SplitText(element, options);
    }
    
    split() {
        const originalText = this.element.textContent;
        const types = this.type.split(',').map(t => t.trim());
        
        if (types.includes('chars')) {
            this.splitChars();
        } else if (types.includes('words')) {
            this.splitWords();
        }
    }
    
    splitChars() {
        const text = this.element.textContent;
        this.element.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = this.charsClass;
            span.style.display = 'inline-block';
            span.textContent = char === ' ' ? '\u00A0' : char; // non-breaking space
            this.element.appendChild(span);
            this.chars.push(span);
        }
    }
    
    splitWords() {
        const text = this.element.textContent;
        const words = text.split(/\s+/);
        this.element.innerHTML = '';
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = this.wordsClass;
            span.style.display = 'inline-block';
            span.textContent = word;
            this.element.appendChild(span);
            this.words.push(span);
            
            // Add space between words (except last word)
            if (index < words.length - 1) {
                this.element.appendChild(document.createTextNode(' '));
            }
        });
    }
    
    revert() {
        if (this.element && this.element.textContent) {
            const text = this.element.textContent;
            this.element.innerHTML = text;
        }
    }
}
