import { IconButton, Table } from "@chakra-ui/react";
import { Checkbox } from "@components/ui/checkbox";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import CreateOverride from "../create";
import styles from "./style.module.scss";

const ListOverride = () => {
  const [lstOverrides, setLstOverrides] = useState([]);
  const [selectedOverride, setSelectedOverride] = useState();

  const editorRef = useRef();

  const form = useForm({
    defaultValues: { method: "GET", status: "200" }
  });

  useEffect(() => {
    try {
      chrome.storage.local.get("overrides", function (v) {
        console.log(v);
        setLstOverrides(v.overrides || []);
      });
    } catch (error) {
      console.log(error);
    }
    if (!editorRef.current) {
      const container = document.getElementById("json-area");
      editorRef.current = new JSONEditor(container, {
        modes: ["code", "tree", "form"]
      });
      editorRef.current.set({});
    }
    return () => editorRef.current?.destroy();
  }, []);

  const handleAdd = () => {
    const values = form.getValues();
    const newList = [
      ...lstOverrides,
      { ...values, json: editorRef.current.get(), enabled: true, id: uuidv4() }
    ];
    setLstOverrides([...newList]);
    submitData(newList);

    form.reset({
      method: "GET",
      status: "200",
      url: ""
    });
    editorRef.current.set({});
  };
  const handleUpdate = () => {
    const idx = lstOverrides.findIndex((i) => i.id == selectedOverride.id);
    if (idx > -1) {
      const sendData = [...lstOverrides];
      const values = form.getValues();

      sendData[idx] = { ...values, json: editorRef.current.get() };
      setLstOverrides([...sendData]);
      setSelectedOverride(undefined);
      submitData(sendData);
      form.reset({
        method: "GET",
        status: "200",
        url: ""
      });
      editorRef.current.set({});
    }
  };

  const onCheckOverride = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const idx = lstOverrides.findIndex((i) => i.id == item.id);
    if (idx > -1) {
      const sendData = [...lstOverrides];
      sendData[idx] = { ...item, enabled: !item.enabled };
      setLstOverrides([...sendData]);
      submitData(sendData);
    }
  };

  const onDelete = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const idx = lstOverrides.findIndex((i) => i.id == item.id);
    lstOverrides.splice(idx, 1);
    setLstOverrides([...lstOverrides]);
    submitData(lstOverrides);
  };

  const submitData = (newData) => {
    try {
      chrome.storage.local.set(
        {
          overrides: newData
        },
        function () {
          console.log("Items update:", newData);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <Table.ScrollArea borderWidth="1px" rounded="md" height="350px">
        <Table.Root size="sm" stickyHeader>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader></Table.ColumnHeader>
              <Table.ColumnHeader>Method</Table.ColumnHeader>
              <Table.ColumnHeader>URL</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Action</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {lstOverrides?.map((item) => (
              <Table.Row
                className={
                  selectedOverride?.id === item.id ? styles.selected : ""
                }
              >
                <Table.Cell>
                  <Checkbox
                    checked={!!item.enabled}
                    onClick={(e) => onCheckOverride(e, item)}
                  />
                </Table.Cell>
                <Table.Cell>{item.method || "-"}</Table.Cell>
                <Table.Cell
                  style={{
                    maxWidth: "400px",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}
                  onClick={() => {
                    setSelectedOverride(item);
                    editorRef.current.set(item.json);
                  }}
                >
                  {item.url || "-"}
                </Table.Cell>
                <Table.Cell>{item.status || "-"}</Table.Cell>
                <Table.Cell>
                  <IconButton size="xs" onClick={(e) => onDelete(item, e)}>
                    <FaTrash />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <CreateOverride
        form={form}
        detail={selectedOverride}
        handleAdd={handleAdd}
        handleUpdate={handleUpdate}
        selectedOverride={selectedOverride}
        onImport={(values) => setLstOverrides(values)}
      />
    </Fragment>
  );
};

export default ListOverride;
