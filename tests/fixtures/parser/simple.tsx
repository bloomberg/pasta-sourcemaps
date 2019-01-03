interface React {
    createElement: Function
}

declare global {
    namespace JSX {
        interface IntrinsicElements { div: any; }
    }
}

const React: React =  {
    createElement: () => {}
};

const bar = () => <div/>;

export default bar;
