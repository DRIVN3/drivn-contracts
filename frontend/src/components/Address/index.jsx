import { Badge } from 'react-bootstrap';

function Address({ value }) {
  return (
    <Badge bg="light">
      <a className="text-decoration-none" target="_blank" href={`https://mumbai.polygonscan.com/address/${value}` } title={value}>
        {value}
      </a>
    </Badge>
  );
}

export default Address;
