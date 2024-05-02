import React, { useEffect, useState } from "react";
import { Input, Table, Tag } from "antd";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../App.css";

export const TableData = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);

  // set URL param
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const queryParams = new URLSearchParams(location.search);
  let urlParams = new URLSearchParams(searchParams);

  // GET URL Params Data
  const query = searchParams.get("page");
  const search = searchParams.get("searchText");
  const [text, setText] = useState(search ?? "");

  console.log(text, "text");
  const columns = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Title",
      dataIndex: "title",
      align: "center",
      key: "id",
    },
    {
      title: "Body",
      dataIndex: "body",
      align: "center",
      key: "body",
      filteredValue: [text],
      onFilter: (value, record) => {
        return String(record.body).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      align: "center",
      key: "tags",
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag color="blue" key={tag} style={{ gap: "20px" }}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  const getData = (skip, limit, searchText) => {
    // use SearchText for searching the Data
    fetch(`https://dummyjson.com/posts?skip=${skip}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data.posts);
        setTotal(data.total);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearchOnEnter = (e) => {
    if (text == "") {
      urlParams.delete("searchText");
      setSearchParams(urlParams.toString());
    } else {
      urlParams.set("searchText", text);
      setSearchParams(urlParams.toString());
    }

    // here you can call api and Adjust the payload for ex-
    //  getData(skip, limit,text)  text for search data also create useSate for skip so that we can easily update the api params Implement Filter same as search or pagination
  };

  useEffect(() => {
    let skip = 0;
    if (query) {
      setCurrentPage(query);
    }
    if (query !== "1") {
      // skip = query * 20 - 20;
      skip = query * limit - limit;
      // console.log(query,"auerys")
    }
    setSkip(skip);
    getData(skip, limit);
  }, [skip, limit]);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    urlParams.set("page", page);
    setSearchParams(urlParams.toString());
    let skip = 0;
    if (page !== 1) {
      skip = page * pageSize - pageSize;
      console.log(skip, "skipsssss");
      setSkip(skip);
    }
    console.log(page, "pages");

    // setSkip(skip);
    getData(skip, limit);
    console.log(pageSize);
    setLimit(pageSize);
  };

  return (
    <>
      <h1>Ant table</h1>
      <div className="">
        <Input.Search
          onSearch={(value) => {
            handleSearchOnEnter(value);
            setText(value);
          }}
          className="custom-input"
        />
      </div>

      <Table
        dataSource={data}
        columns={columns}
        size="small"
        style={{ margin: "auto", width: "80%" }}
        pagination={{
          current: currentPage,
          pageSize: limit,
          total: total,
          onChange: handlePageChange,
        }}
        rowClassName="row-class"
      />
    </>
  );
};
