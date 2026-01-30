import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const [directoryItems, setDirectoryItems] = useState([]);
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [dirName, setDirName] = useState("");
  const { "*": dirPath } = useParams();

  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirPath}`);
    const data = await response.json();
    setDirectoriesList(data.directories);
    setFilesList(data.files);
  }


  async function uploadFile(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${file.name}`, true);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });
    xhr.send(file);
  }

  async function handleDelete(fileId) {
    const response = await fetch(`${BASE_URL}/file/${fileId}`, {
      method: "DELETE",
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    console.log({ oldFilename, newFilename });
    setNewFilename(oldFilename);
  }

  async function saveFilename(fileId) {
    const response = await fetch(
      `${BASE_URL}/file/${fileId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newFilename }),
      }
    );
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }

  const handleCreateDirectory = async (e) => {
    e.preventDefault()
    const response = await fetch(`${BASE_URL}/directory/${dirPath ? '/' + dirName : ""}/${dirName}`, {
      method: "POST",

    })
    const data = await response.json()
    console.log(data)
    getDirectoryItems()
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirPath]);
  return (
    <>
      <h1>My Files</h1>
      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />
      <p>Progress: {progress}%</p>
      <form onSubmit={handleCreateDirectory}>
        <input type="text" onChange={(e) => setDirName(e.target.value)} />
        <button type="submit">Create Folder</button>
      </form>

      {filesList.map(({ name, id }) => (
        <div key={id}>
          {name}

          <a href={`${BASE_URL}/file/${id}`}>
            Open
          </a>{" "}

          <a href={`${BASE_URL}/file/${id}?action=download`}>
            Download
          </a>{" "}

          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveFilename(id)}>Save</button>
          <button
            onClick={() => {
              handleDelete(id);
            }}
          >
            Delete
          </button>
          <br />
        </div>
      ))}
    </>
  );
}

export default DirectoryView;
