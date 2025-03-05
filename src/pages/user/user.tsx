import PaginationUserTable from 'pages/tables/react-table/paginationUser';

function user() {
  // Use client1 for the first query (connected to the first GraphQL endpoint)
  return <PaginationUserTable />;
}

export default user;