import {TextField, IndexTable, TextStyle, Card, Filters, Select, EmptySearchResult, useIndexResourceState, Pagination} from "@shopify/polaris";
import {useState, useEffect, useCallback} from "react";


export default function PolarisTable({tableData}) {
  const [sortArray, setSortArray] = useState([])
  const [slicePointers, setSlicePointers] = useState({
    first: 0,
    second: 3
  })
 
  const [isButtonDisabled, setisButtonDisabled] = useState({
    prev: true,
    next: true
  })
  // const [tableData, setTableData] = useState([
  //   {
  //     orderId: 1,
  //     orderName:
  //       "Pinus leiophylla Schiede & Deppe var. chihuahuana (Engelm.) Shaw",
  //     orderNumber: "341690191557947",
  //     createdAt: "1/9/2022",
  //     status: "Success",
  //   },
  //   {
  //     orderId: 2,
  //     orderName: "Cyperus bipartitus Torr.",
  //     orderNumber: "3554853164944551",
  //     createdAt: "3/2/2022",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 3,
  //     orderName: "Hypogymnia (Nyl.) Nyl.",
  //     orderNumber: "3563896818265229",
  //     createdAt: "8/30/2022",
  //     status: "Success",
  //   },
  //   {
  //     orderId: 4,
  //     orderName: "Minuartia glabra (Michx.) Mattf.",
  //     orderNumber: "676279844457776088",
  //     createdAt: "9/11/2022",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 5,
  //     orderName: "Lupinus lapidicola A. Heller",
  //     orderNumber: "3551942096080213",
  //     createdAt: "6/25/2022",
  //     status: "Success",
  //   },
  //   {
  //     orderId: 6,
  //     orderName: "Aristida purpurascens Poir. var. virgata (Trin.) Allred",
  //     orderNumber: "6397227688174330",
  //     createdAt: "12/5/2021",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 7,
  //     orderName: "Pilea inaequalis (Juss. ex Poir.) Weddell",
  //     orderNumber: "5602226753667379",
  //     createdAt: "12/30/2021",
  //     status: "Success",
  //   },
  //   {
  //     orderId: 8,
  //     orderName: "Yucca flaccida Haw.",
  //     orderNumber: "5541185515179293",
  //     createdAt: "10/30/2021",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 9,
  //     orderName: "Yucca flaccida Haw.",
  //     orderNumber: "5541185515179293",
  //     createdAt: "8/30/2021",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 10,
  //     orderName: "Yucca flaccida Haw.",
  //     orderNumber: "5541185515179293",
  //     createdAt: "27/30/2021",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 11,
  //     orderName: "Yucca flaccida Haw.",
  //     orderNumber: "5541185515179293",
  //     createdAt: "10/30/2021",
  //     status: "Failed",
  //   },
  // ]);
  const [dataOriginal, setDataOriginal] = useState(tableData)
  const [paginatedData, setpaginatedData] = useState(tableData)
  const [selected, setSelected] = useState('today');
  const options = [
    { label: "default", value: "default" },
    { label: "Date newest", value: "newest" },
    { label: "Date oldest", value: "oldest" },
  ];
  const [filteredArray, setFilteredArray] = useState([])
  const [showEmptyState, setShowEmptyState] = useState(false)
  const resourceName = {
    singular: "order",
    plural: "orders",
  };
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableData);
  const [taggedWith, setTaggedWith] = useState("VIP");
  let [queryValue, setQueryValue] = useState(null);



  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    []
  );





 



//  xvailndeli todos //
//  1. routepropagate - buildma ushvela???
//  2. add shop name and status from fetch
//  3. sort / bagi sortshi!!!!!!
//  4. format data
//  5. pagination and paginate data
//  6. mobile design



  const filters = [
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
        />
      ),
    },
  ];

 


  
  // useEffect(() => {
  //    let dataCopy = [...tableData]
  //    let slicedData = dataCopy.slice(slicePointers.first, slicePointers.second)
  //    setpaginatedData(slicedData)
  // }, [slicePointers])
      

  let rowMarkup = filteredArray.length === 0 ? tableData.map(
    ({ orderId, orderName, createdAt, status }, index) => (
      <IndexTable.Row
        id={orderId}
        key={orderId}
        selected={selectedResources.includes(orderId)}
        position={index}
      >
        <IndexTable.Cell> <TextStyle variation="strong">{orderName}</TextStyle> </IndexTable.Cell>
        <IndexTable.Cell>{orderId}</IndexTable.Cell>
        <IndexTable.Cell>{createdAt}</IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
      </IndexTable.Row>
    ) 
  ) :
  filteredArray.map(
    ({ orderId, orderName, orderNumber, createdAt, status }, index) => (
      <IndexTable.Row
        id={orderId}
        key={orderId}
        selected={selectedResources.includes(orderId)}
        position={index}
      >
        <IndexTable.Cell> <TextStyle variation="strong">{orderName}</TextStyle> </IndexTable.Cell>
        <IndexTable.Cell>{orderNumber}</IndexTable.Cell>
        <IndexTable.Cell>{createdAt}</IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
      </IndexTable.Row>
    ) 
  ) 



  if(sortArray.length !== 0 ) {
    rowMarkup = sortArray.map(
      ({ orderId, orderName, orderNumber, createdAt, status }, index) => (
        <IndexTable.Row
          id={orderId}
          key={orderId}
          selected={selectedResources.includes(orderId)}
          position={index}
        >
          <IndexTable.Cell>
            <TextStyle variation="strong">{orderName}</TextStyle>
          </IndexTable.Cell>
          <IndexTable.Cell>{orderNumber}</IndexTable.Cell>
          <IndexTable.Cell>{createdAt}</IndexTable.Cell>
          <IndexTable.Cell>{status}</IndexTable.Cell>
        </IndexTable.Row>
      ) 
    )

  }

  
  const emptyStateMarkup = (
    <Card style={{"backgroundColor": "red"}}>
     <EmptySearchResult
      title={'No orders found'}
      description={'Try changing the filters or search term'}
      withIllustration />
    </Card>
    
  );
  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 0.5 }}>
          <Filters
            queryValue={queryValue}
            filters={filters}
          
            onQueryChange={(e) => {
              setShowEmptyState(false)
              let tableDataCopySearch = [...tableData]
            
              let filteredResult = tableData.filter((customer) => customer.orderName.toLowerCase().includes(e.toLowerCase()) || customer.orderId.toString().toLowerCase().includes(e.toLowerCase()) || customer.createdAt.toLowerCase().includes(e.toLowerCase()) || customer.status.toLowerCase().includes(e.toLowerCase()));
             
              setFilteredArray(filteredResult)
              if(filteredResult.length === 0) setShowEmptyState(true)
              if(e.length === 0) setFilteredArray([])
            }}

            onQueryClear={() => setQueryValue(null)}
           
          />
        </div>
        <div style={{ paddingLeft: "0.25rem" }}>
          {/* <Select
           labelInline
           label="Sort by"
            options={options}
            onChange={(e) => {
              setSelected(e)
              if(e === "newest") {
                const tableDataCopy = [...paginatedData]
                const f = [...filteredArray]
                tableDataCopy.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1) 
                // setTableData(tableDataCopy);
                setFilteredArray(tableDataCopy);
              }
              if(e === "oldest") {
                const tableDataCopyoldest = [...paginatedData] 
                tableDataCopyoldest.sort((a, b) => a.createdAt < b.createdAt ? -1 : 1) 
                setpaginatedData(tableDataCopyoldest)
                setFilteredArray(tableDataCopyoldest);
              }
              if(e === "default") {
              
                // setTableData(dataOriginal)
                setFilteredArray(dataOriginal);
              }
            }}
            value={selected}
          /> */}
        </div>
      </div>
      {showEmptyState === true ? emptyStateMarkup :
       
       <IndexTable
        resourceName={resourceName}
        itemCount={tableData.length}
        // sortable={[true, true, true, true]}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Order name" },
          { title: "Order number" },
          { title: "Order data" },
          { title: "Send status" },
        ]}>
        {rowMarkup} 
      </IndexTable>}
     

<div className="pagination_container">
   {/* <Pagination
      hasPrevious={isButtonDisabled.prev}
      onPrevious={() => {
        console.log('Previous');
        setSlicePointers({
          ...slicePointers, 
          first: slicePointers.first - 3,
          second: slicePointers.second - 3
        }) 
      }}
      hasNext={isButtonDisabled.next}
      onNext={() => {
        console.log('Next');
        setSlicePointers({
          ...slicePointers, 
          first: slicePointers.first + 3,
          second: slicePointers.second + 3
        }) 
      }}
    /> */}


</div>
     
    </>
  );

  function disambiguateLabel(key, value) {
    switch (key) {
      case "taggedWith":
        return `Tagged with ${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}
