import { React, useEffect, useCallback, useState } from "react";
import { SearchMinor } from "@shopify/polaris-icons";
import FilterableTable from "react-filterable-table";
import {Select} from "@shopify/polaris";

function MyTable({tableData}) {
  const [selected, setSelected] = useState("newestUpdate");
  // const [data, setData] = useState([
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
  //     createdAt: "10/30/2021",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 10,
  //     orderName: "Yucca flaccida Haw.",
  //     orderNumber: "5541185515179293",
  //     createdAt: "10/30/2021",
  //     status: "Failed",
  //   },
  //   {
  //     orderId: 11,
  //     orderName: "Yucca flaccida Haw.",
  //     orderNumber: "5541185515179293",
  //     createdAt: "10/30/2021",
  //     status: "Failed",
  //   },
  // ])

  const [data, setData] = useState([])
  const [originalData, setOriginalData] = useState(tableData)
  const fields = [
    {
      name: "orderName",
      displayName: "Order name",
      inputFilterable: true,
      exactFilterable: true,
      sortable: true,
    },
    {
      name: "orderId",
      displayName: "Order number",
      inputFilterable: true,
      exactFilterable: true,
      sortable: true,
    },
    {
      name: "createdAt",
      displayName: "Order data",
      inputFilterable: true,
      exactFilterable: true,
      sortable: true,
    },
    {
      name: "status",
      displayName: "Send Status",
      inputFilterable: true,
      exactFilterable: true,
      sortable: true,
    },
  ];


 



  const handleSelectChange = useCallback((value) => {
    setSelected(value);
    switch (value) {
      case "default":
        setData(originalData);
        break;
        
        case "atoz":
        const atoz = data.sort((a, b) =>
          a.orderName < b.orderName ? -1 : 1,
        );
        setData(atoz);
        break;

        case "ztoa":
        const ztoa = data.sort((a, b) =>
          a.orderName > b.orderName ? -1 : 1,
        );
        setData(ztoa);
        break;
      }

  }, []);
  const options = [
    { label: "default", value: "default" },
    { label: "Order name A-Z", value: "atoz" },
    { label: "Order name Z-A", value: "ztoa" },
    { label: "Order date newest", value: "date_newest" },
    { label: "Order date lowest", value: "date_oldest" },
  ];
  return (
    tableData.length === 0 ?  <h1>loading</h1> :
    <div className="pd">

    <Select
      label="Sort by"
      labelInline
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
    <FilterableTable
      iconSort={"↑↓"}
      iconSortedAsc={"↑"}
      iconSortedDesc={"↓"}
      data={tableData}
      fields={fields}
      tableClassName="Polaris-IndexTable__Table"
      trClassName="Polaris-IndexTable__TableRow"
      thClassName="Polaris-IndexTable__TableHeading Polaris-IndexTable__TableHeading"
      pageSizes={null}
      topPagerVisible={false}
      bottomPagerVisible={true}
      namespace="OrderList"
      initialSort="name"
      noRecordsMessage="There are no orders to display"
      noFilteredRecordsMessage="No orders match your filters!"
      pagerTopClassName="x"
      emptyDisplay="not set"
      pagerTitles={{ first: "first ", last: "last" }}
      className="mycustomtable"
      recordCountName="order"
      recordCountNamePlural="orders"
    />
    </div>
  );
}

export default MyTable;
