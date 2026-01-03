// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientRecords {
    struct Patient {
        string name;
        uint age;
        string diagnosis;
        string ipfsHash;
    }

    mapping(address => Patient) private records;

    event RecordAdded(
        address indexed patient,
        string name,
        uint age,
        string diagnosis,
        string ipfsHash
    );

    function addRecord(
        string memory _name,
        uint _age,
        string memory _diagnosis,
        string memory _ipfsHash
    ) public {
        records[msg.sender] = Patient(
            _name,
            _age,
            _diagnosis,
            _ipfsHash
        );

        emit RecordAdded(
            msg.sender,
            _name,
            _age,
            _diagnosis,
            _ipfsHash
        );
    }

    function getRecord(address _patient)
        public
        view
        returns (string memory, uint, string memory, string memory)
    {
        Patient memory p = records[_patient];
        return (p.name, p.age, p.diagnosis, p.ipfsHash);
    }
}
