// Example taken from https://reactjs.org/docs/lists-and-keys.html
function ListItem(props) {
    return <li>({(function () {return 5;})()})</li>;
}

function NumberList(props) {
    const numbers = props.numbers;
    const listItems = numbers.map((number) => (
        <ListItem key={number.toString()} value={number} />
    ));
    return <ul>{listItems}</ul>;
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
    <NumberList numbers={numbers} />,
    document.getElementById("root")
);
