import React from 'react';

const DocumentsPage = () => {
  const documents = [
    { id: 1, name: 'Employee Handbook', type: 'PDF', size: '2.3 MB', updated: 'Feb 10, 2026' },
    { id: 2, name: 'Health Insurance Policy', type: 'PDF', size: '1.1 MB', updated: 'Feb 5, 2026' },
    { id: 3, name: 'Leave Application Form', type: 'DOC', size: '245 KB', updated: 'Feb 1, 2026' },
    { id: 4, name: 'Company Code of Conduct', type: 'PDF', size: '890 KB', updated: 'Jan 28, 2026' },
    { id: 5, name: 'IT Security Guidelines', type: 'PDF', size: '1.5 MB', updated: 'Jan 25, 2026' }
  ];

  return (
    <div className="documents-page">
      <h1>📄 Documents</h1>
      
      <div className="documents-header">
        <button className="upload-btn">+ Upload Document</button>
      </div>

      <div className="documents-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                <td>{doc.size}</td>
                <td>{doc.updated}</td>
                <td>
                  <button className="download-btn">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsPage;