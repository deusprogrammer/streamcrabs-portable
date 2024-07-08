import React, { useState } from 'react';
import { migrate } from '../api/StreamCrabsApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const Migration = () => {
    const [migrationKey, setMigrationKey] = useState("");
    const [migrating, setMigrating] = useState(false);
    const navigate = useNavigate();

    const importConfig = async () => {
        toast.info("Migrating data...");
        setMigrating(true);
        await migrate(migrationKey);
        setMigrating(false);
        toast.info("Migration complete");
        navigate("/");
    }

    return (
        <div>
            <p>Please go to <a href="http://deusprogrammer.com/streamcrabs/migrations">the streamcrabs site</a> and get your migration code to import your config into the desktop app.</p>
            <input value={migrating ? "migrating..." : migrationKey} disabled={migrating} onChange={({target: {value}}) => {setMigrationKey(value)}} /><button onClick={() => {importConfig()}} disabled={migrating}>Migrate</button>
        </div>
    )
};

export default Migration;