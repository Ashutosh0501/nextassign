import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import {matchSorter} from 'match-sorter';
import queryString from 'query-string';
import Select from 'react-select';
import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

const fetchPhotos = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/photos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
};


const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const HomePage = () => {
  const router = useRouter();
  const { query } = router;

  const [photos, setPhotos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRowsPerPageChange = (selectedOption) => {
    const selectedRowsPerPage = selectedOption.value;
    setRowsPerPage(selectedRowsPerPage);

    const queryParameters = queryString.stringify({
      ...query,
      rows: selectedRowsPerPage,
    });

    router.push(`/?${queryParameters}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const getPhotos = async () => {
      const data = await fetchPhotos();
      setPhotos(data);
    };

    getPhotos();
  }, []);

  useEffect(() => {
    const filteredPhotos = matchSorter(photos, searchTerm, {
      keys: ['title'],
    });

    const totalPagesCount = Math.ceil(filteredPhotos.length / rowsPerPage);
    setTotalPages(totalPagesCount);
    setCurrentPage(1);
  }, [photos, rowsPerPage, searchTerm]);

  useEffect(() => {
    const { page, rows } = query;
    const selectedPage = Number(page) || 1;
    const selectedRowsPerPage = Number(rows) || rowsPerPage;

    setCurrentPage(selectedPage);
    setRowsPerPage(selectedRowsPerPage);
  }, [query]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginatedPhotos = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const filteredPhotos = matchSorter(photos, searchTerm, {
      keys: ['title'],
    });

    return filteredPhotos.slice(startIndex, endIndex);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
      <div className="pagination">
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={pageNumber === currentPage ? 'active' : ''}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    );
  };

  const renderPhotos = () => {
    const paginatedPhotos = getPaginatedPhotos();

    return paginatedPhotos.map((photo) => (
      <div key={photo.id} className="photo">
        <img src={photo.thumbnailUrl} alt={photo.title} />
        <p>{photo.title}</p>
      </div>
    ));
  };

  return (
    <div className="container">
      <h1>Next JS Assignment</h1>
      <h4>Search Images by name:</h4>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <h4>Rows per page:</h4>
        <Select
          className="rows-per-page-select"
          options={ROWS_PER_PAGE_OPTIONS.map((option) => ({
            value: option,
            label: String(option),
          }))}
          value={{ value: rowsPerPage, label: String(rowsPerPage) }}
          onChange={handleRowsPerPageChange}
        />
      </div>
      {renderPhotos()}
      {renderPagination()}
    </div>
  );
};

export default HomePage;
