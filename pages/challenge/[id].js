import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function ID() {
    const data = {
        flutter: {
            github: "",
            readme: "",
            bugNumbers: 4
        },
        react: {
            github: "",
            readme: "",
            bugNumbers: 4
        },
        vue: {
            github: "",
            readme: "",
            bugNumbers: 4
        },
        angular: {
            github: "",
            readme: "",
            bugNumbers: 4
        },
    }

    const router = useRouter();
    const { id } = router.query;
    const [title, setTitle] = useState(id);
    const [files, setFiles] = useState([]);


    useEffect(() => {
        setTitle(id)
    }, [id]);

    useEffect(() => {
        axios.get('http://localhost:8001/me', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        }).then((res) => {
            console.log(res.data)
        }).catch((err) => {
            if (err.response.status === 401) {
                window.location.href = '/'
            }
            console.log(err)
        })
    }, []);

    const handleInputChange = (index, event) => {
        const file = event.target.files[0];
        const newFiles = [...files];
        newFiles[index] = file;
        setFiles(newFiles);
    };

    const handleUpload = (index) => {
        const file = files[index];
        const formData = new FormData();
        formData.append('patch', file);
        axios.post(`http://localhost:8001/questions/${index + 1}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        }).then((res) => {
            console.log(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }

    return (
        title && <div className='bg-black/80 min-h-screen flex flex-col gap-10 justify-center items-center'>
            {data[title]?.github}
            <div>
                {Array.from({ length: data[title].bugNumbers }, (_, index) => (
                    <div key={index}>
                        <input
                            type="file"
                            onChange={(event) => handleInputChange(index, event)}
                            placeholder={`Input ${index + 1}`}
                        />
                        <button
                            onClick={() => handleUpload(index)}
                            className='text-white text-xl p-2 rounded-md bg-blue-500 hover:bg-blue-700 transition-all'
                        >
                            Upload
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

