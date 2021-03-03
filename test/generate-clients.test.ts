import { generateClient } from "../src";

(async function name() {
    await generateClient("Dummy", "./test/resources/Dummy.wsdl", "./test/generated/Dummy");
    await generateClient("array_namespace_override", "./test/resources/array_namespace_override.wsdl", "./test/generated/array_namespace_override");
    await generateClient("attachments", "./test/resources/attachments.wsdl", "./test/generated/attachments");
    await generateClient("binding-exception", "./test/resources/binding-exception.wsdl", "./test/generated/binding-exception");
    await generateClient("binding_document", "./test/resources/binding_document.wsdl", "./test/generated/binding_document");
    await generateClient("builtin_types", "./test/resources/builtin_types.wsdl", "./test/generated/builtin_types");
    await generateClient("cross_schema", "./test/resources/cross_schema.wsdl", "./test/generated/cross_schema");
    await generateClient("default_namespace", "./test/resources/default_namespace.wsdl", "./test/generated/default_namespace");
    await generateClient("default_namespace_soap12", "./test/resources/default_namespace_soap12.wsdl", "./test/generated/default_namespace_soap12");
    await generateClient("empty_body", "./test/resources/empty_body.wsdl", "./test/generated/empty_body");
    await generateClient("extended_element", "./test/resources/extended_element.wsdl", "./test/generated/extended_element");
    await generateClient("extended_recursive", "./test/resources/extended_recursive.wsdl", "./test/generated/extended_recursive");
    await generateClient("include_with_duplicated_namespace", "./test/resources/include_with_duplicated_namespace.wsdl", "./test/generated/include_with_duplicated_namespace");
    await generateClient("json_response", "./test/resources/json_response.wsdl", "./test/generated/json_response");
    await generateClient("list_parameter", "./test/resources/list_parameter.wsdl", "./test/generated/list_parameter");
    await generateClient("marketo", "./test/resources/marketo.wsdl", "./test/generated/marketo");
    await generateClient("non_identifier_chars_in_operation", "./test/resources/non_identifier_chars_in_operation.wsdl", "./test/generated/non_identifier_chars_in_operation");
    // await generateCli"recursive", ent("./test/resources/recursive.wsdl", "./test/generated/recursive");
    await generateClient("recursive2", "./test/resources/recursive2.wsdl", "./test/generated/recursive2");
    await generateClient("redefined-ns", "./test/resources/redefined-ns.wsdl", "./test/generated/redefined-ns");
    await generateClient("ref_element_same_as_type", "./test/resources/ref_element_same_as_type.wsdl", "./test/generated/ref_element_same_as_type");
    await generateClient("rpcexample", "./test/resources/rpcexample.wsdl", "./test/generated/rpcexample");
    await generateClient("self_referencing", "./test/resources/self_referencing.wsdl", "./test/generated/self_referencing");
    await generateClient("typeof_null_extend_check", "./test/resources/typeof_null_extend_check.wsdl", "./test/generated/typeof_null_extend_check");
    await generateClient("ws-policy", "./test/resources/ws-policy.wsdl", "./test/generated/ws-policy");
})();
