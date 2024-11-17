"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";

export default function AddBountyForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    expectedOutput: "",
    output: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOutputChange = (e) => {
    setFormData({ ...formData, output: e.target.value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className={styles.container}>
      <h1>Add a New Bounty</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Bounty Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter the bounty title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Provide a detailed description of the bounty"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="reward">Reward (ETH)</label>
          <input
            type="number"
            id="reward"
            name="reward"
            placeholder="Enter the reward amount in ETH"
            value={formData.reward}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="deadline">Deadline</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="expectedOutput">Expected Output</label>
          <textarea
            id="expectedOutput"
            name="expectedOutput"
            placeholder="Describe the expected output for this bounty"
            value={formData.expectedOutput}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="expectedOutput">Tests</label>
          <CodeMirror
          value={formData.output}
          height="300px"
          theme={dracula}
          className={styles.CodeMirror}
          extensions={[javascript(),]}
          onChange={handleOutputChange}
        />
        </div>
        <button type="submit" className={styles.submitBtn}>
          Submit Bounty
        </button>
      </form>
    </div>
  );
}
