import React, { useEffect, useState } from "react";
import { Input, Table, Tag, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../App.css";

export const TableData = () => {
  const [data, setData] = useState([]);
  const [filter, setFilterData] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  // set URL param
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentPath = location.pathname;
  const queryParams = new URLSearchParams(location.search);
  let urlParams = new URLSearchParams(searchParams);

  // GET URL Params Data
  const query = searchParams.get("page");
  const search = searchParams.get("searchText");
  const filterParam = searchParams.get("filter");
  const [text, setText] = useState(search ?? "");

  const columns = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      align: "center",
      className: "column-id",
    },
    {
      title: "Title",
      dataIndex: "title",
      align: "center",
      key: "title",
      className: "column-title",
    },
    {
      title: "Body",
      dataIndex: "body",
      align: "center",
      key: "body",
      className: "column-body",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      align: "center",
      key: "tags",
      className: "column-tags",
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag color="blue" key={tag} style={{ gap: "60px" }}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  const getData = (skip, limit, searchText) => {
    let url;
    if (skip || limit) {
      url = `https://dummyjson.com/posts?skip=${skip}&limit=${limit}`;
    }
    if (searchText) {
      url = `https://dummyjson.com/posts/search?q=${searchText}&skip=${skip}&limit=${limit}`;
    }
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setData(data.posts);
        setFilterData(data.posts);
        setTotal(data.total);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Search on press Enter

  const handleSearchOnEnter = (e) => {
    setText(e);

    if (e === "") {
      urlParams.delete("searchText");
      setSearchParams(urlParams.toString());
      let skip = query * 10 - 10;
      setSkip(skip);
      getData(skip, limit);
    } else {
      urlParams.set("searchText", e);
      setSearchParams(urlParams.toString());

      getData(0, limit, e);
    }
  };

  useEffect(() => {
    let skip = 0;
    if (query) {
      setCurrentPage(query);
    }
    if (query !== "1") {
      skip = query * limit - limit;
    }
    setSkip(skip);
    getData(skip, limit, search);
  }, [skip, limit]);

  useEffect(() => {
    if (filterParam) {
      const selectedItems = filterParam.split(",");
      setSelectedValues(selectedItems);

      if (selectedItems.length > 0) {
        const filteredData = filter.filter((obj) => {
          return obj.tags.some((tag) => selectedItems.includes(tag));
        });

        setData(filteredData);
        setTotal(filteredData.length);
      }
    }
  });

  // Function to handle pagination

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    urlParams.set("page", page);
    setSearchParams(urlParams.toString());
    let skip = 0;
    if (page !== 1) {
      skip = page * pageSize - pageSize;
    }

    setSkip(skip);
    getData(skip, limit);

    setLimit(pageSize);
  };
  const options = [
    { label: "history", value: "history" },
    { label: "american", value: "american" },
    { label: "crime", value: "crime" },
    { label: "french", value: "french" },
    { label: "fiction", value: "fiction" },
    { label: "english", value: "english" },
    { label: "magical", value: "magical" },
    { label: "mystery", value: "mystery" },
    { label: "love", value: "love" },
    { label: "classic", value: "classic" },
  ];

  // Function to handle filter the multiple selected data

  const handleChange = (value) => {
    setSelectedValues(value);

    const selectedData = value.map((val) => val);
    urlParams.set("filter", selectedData);
    setSearchParams(urlParams.toString());
    if (selectedData.length > 0) {
      const filteredData = filter.filter((obj) => {
        return obj.tags.some((tag) => selectedData.includes(tag));
      });
      setData(filteredData);
      setTotal(filteredData.length);
    } else {
      getData(skip, limit, search);
      urlParams.delete("filter");
      setSearchParams(urlParams.toString());
    }
  };

  return (
    <>
      <h1 className="heading">Get Your Post</h1>
      <div className="search-filter">
        <Input.Search
          placeholder="Search based on body..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSearch={(value) => {
            handleSearchOnEnter(value);
          }}
          className="custom-input"
        />

        <Select
          mode="multiple"
          allowClear
          filterOption
          placeholder="Please select"
          onChange={handleChange}
          options={options}
          value={selectedValues}
          className="select"
        />
      </div>

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        size="small"
        style={{
          margin: "auto",
          width: "80%",
          marginTop: "30px",
          marginBottom: "20px",
        }}
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
