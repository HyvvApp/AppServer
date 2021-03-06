import React from "react";
import equal from "fast-deep-equal/react";
import {
  FieldContainer,
  SelectorAddButton,
  SelectedItem,
} from "asc-web-components";
import { GroupSelector } from "asc-web-common";

class DepartmentField extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !equal(this.props, nextProps);
  }

  onRemoveGroup = (e) => {
    const groupId = e.currentTarget.parentElement.dataset.id;
    this.props.onRemoveGroup(groupId);
  };

  render() {
    console.log("DepartmentField render");

    const {
      isRequired,
      isDisabled,
      hasError,
      labelText,

      showGroupSelectorButtonTitle,

      onShowGroupSelector,
      onCloseGroupSelector,

      selectorIsVisible,
      selectorSelectedOptions,
      selectorOnSelectGroups,
    } = this.props;

    return (
      <FieldContainer
        isRequired={isRequired}
        hasError={hasError}
        labelText={labelText}
        className="departments-field"
      >
        <SelectorAddButton
          isDisabled={isDisabled}
          title={showGroupSelectorButtonTitle}
          onClick={onShowGroupSelector}
          className="department-add-btn"
        />
        <GroupSelector
          isOpen={selectorIsVisible}
          isMultiSelect={true}
          onSelect={selectorOnSelectGroups}
          onCancel={onCloseGroupSelector}
        />
        {selectorSelectedOptions.map((option) => (
          <SelectedItem
            key={`department_${option.key}`}
            text={option.label}
            data-id={option.key}
            onClose={this.onRemoveGroup}
            isInline={true}
            className="department-item"
            isDisabled={isDisabled}
          />
        ))}
      </FieldContainer>
    );
  }
}

export default DepartmentField;
